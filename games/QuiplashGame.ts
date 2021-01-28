import {
    Collection,
    Message,
    MessageEmbed,
    MessageReaction,
    NewsChannel,
    Snowflake,
    TextChannel,
    User
} from "discord.js";
import Jackbot from "../Jackbot";
import * as prompts from "../prompts.json";

export default class QuiplashGame {
    client: Jackbot;
    joinMessage: Message;
    joinEmbed: MessageEmbed;
    joinMessageChannel: TextChannel | NewsChannel;
    nsfw: boolean;
    players: Collection<Snowflake, User>;
    assignedPrompts: Collection<Snowflake, {prompt: string, nsfw?: boolean}[]>;
    completedPrompts: Collection<Snowflake, string[]>;
    gamePrompts: {prompt: string, nsfw?: boolean}[];
    gameChannel: TextChannel;
    promptEmbed: MessageEmbed;
    promptMessage: Message;

    constructor(client: Jackbot, joinMessage: Message) {
        this.client = client;
        this.joinMessage = joinMessage;
        if (joinMessage.channel.type === "dm") throw new Error("Quiplash Game created from DM");
        this.joinMessageChannel = joinMessage.channel;
        this.joinEmbed = joinMessage.embeds[0];
        this.nsfw = this.joinMessageChannel.nsfw;

        joinMessage.react("802035201445199883").catch(console.error);

        const collector = joinMessage.createReactionCollector((reaction, user) => reaction.emoji.id === "802035201445199883" && !user.bot, {
            time: 45000,
            maxUsers: 8,
            dispose: true
        });

        collector.on("collect", this.onUserJoin.bind(this));
        collector.on("remove", this.onUserLeave.bind(this));
        collector.on("end", this.onGameStart.bind(this));
    }

    async onUserJoin(reaction: MessageReaction, user: User) {
        try {
            const dm = await user.createDM();
            await dm.send(`You have joined the game of **Quiplash!** in ${this.joinMessage.guild.name}!`);
        } catch {
            await this.joinMessageChannel.send(`${user}, you need to have your DM's open in order to play this game.`);
            await reaction.users.remove(user);
            return;
        }
        this.joinEmbed.setDescription(`A game of **Quiplash!** is starting now!\n\nReact with <:play:802035201445199883> in the next 45 seconds to join!\n${reaction.users.cache.filter(u => !u.bot).size}/8 players in game`)
        await this.joinMessage.edit(this.joinEmbed);
    }

    async onUserLeave(reaction: MessageReaction, user: User) {
        try {
            const dm = await user.createDM();
            await dm.send(`You have left the game of **Quiplash!** in ${this.joinMessage.guild.name}!`);
        } catch {}
        this.joinEmbed.setDescription(`A game of **Quiplash!** is starting now!\n\nReact with <:play:802035201445199883> in the next 45 seconds to join!\n${reaction.users.cache.filter(u => !u.bot).size}/8 players in game`)
        await this.joinMessage.edit(this.joinEmbed);
    }

    async onGameStart(collected: Collection<Snowflake, MessageReaction>) {
        await this.joinMessage.delete();

        this.players = collected.has("802035201445199883") ? collected.get("802035201445199883").users.cache.filter(u => !u.bot) : new Collection<Snowflake, User>();
        if (this.players.size < 3) {
            this.joinEmbed.setDescription("This game has ended: 3 or more players required");
            this.joinEmbed.setThumbnail(null);
            await this.joinMessageChannel.send(this.joinEmbed);
            return;
        }

        this.players = this.players.sort(() => 0.5 - Math.random());

        this.joinEmbed.setDescription("Sending prompts, please wait...");
        this.assignedPrompts = new Collection(this.players.map(u => [u.id, []]));
        this.completedPrompts = new Collection(this.players.map(u => [u.id, []]));

        this.joinMessage = await this.joinMessageChannel.send(this.joinEmbed);
        this.gamePrompts = prompts.filter(p => this.nsfw || !p.nsfw).sort(() => 0.5 - Math.random()).slice(0, this.players.size);

        for (let i = 0; i < this.gamePrompts.length; i++) {
            let apa = this.assignedPrompts.array();
            apa[i].push(this.gamePrompts[i]);
            apa[i + 1 < this.players.size ? i + 1 : 0].push(this.gamePrompts[i]);
        }

        const guild = this.joinMessage.guild;

        const category = await guild.channels.create("Jackbot", {type: 'category'});
        if (category.children.find(c => c.type === "text" && c.name === "quiplash"))
            await (category.children.find(c => c.type === "text" && c.name === "quiplash")).delete();
        this.gameChannel = await guild.channels.create("quiplash", {
            type: "text",
            parent: category,
            permissionOverwrites: [{
                id: guild.id,
                deny: ["SEND_MESSAGES", "ADD_REACTIONS"]
            }, {
                id: this.client.user.id,
                allow: ["SEND_MESSAGES", "ADD_REACTIONS"]
            }],
            nsfw: this.nsfw
        });

        this.players.forEach(user => this.dmPrompt(user, 1));

        this.joinEmbed.setDescription(`Prompts have been sent! You have 90 seconds to answer your prompts.\n\nAfter the time is up, vote for your favorite prompts in ${this.gameChannel}`);
        await this.joinMessage.edit(this.joinEmbed);
    }

    async dmPrompt(player: User, promptNumber: number) {
        const dm = await player.createDM();
        const embed = new MessageEmbed();

        embed.setTitle(`Prompt ${promptNumber} of 2`);
        embed.setDescription(this.assignedPrompts.get(player.id)[promptNumber - 1].prompt);
        embed.setFooter("Respond to this message with your prompt!");
        embed.setColor("RANDOM");

        await dm.send(embed);

        const collector = dm.createMessageCollector(m => m.author.id === player.id, {
            max: 1,
            time: 45000
        });

        collector.on("end", () => {
            if (promptNumber < 2) return this.dmPrompt(player, ++promptNumber);
            embed.setTitle("Finished")
            embed.setDescription(`Get ready to vote for your favorite prompts in ${this.gameChannel}!`);
            embed.footer = null;
            dm.send(embed);
            this.onUserFinishedResponses();
        });
    }

    async onUserFinishedResponses() {
        if (this.completedPrompts.filter(p => p.length === 2).size !== this.players.size) return;
        this.joinEmbed.setDescription(`Everyone has finished their prompts!\n\nChoose your favorite response in ${this.gameChannel}!`);
        await this.joinMessage.delete();
        this.joinMessage = await this.joinMessageChannel.send(this.joinEmbed);

        this.promptEmbed = new MessageEmbed();
        this.promptEmbed.setColor("RANDOM");
        this.promptEmbed.setFooter("Vote for your favorite prompt below!");
        this.promptMessage = await this.gameChannel.send(this.promptEmbed);

        for (let i in this.gamePrompts) {
            await this.sendPrompt(i);
        }
    }

    sendPrompt(i: string) {
        return new Promise(async (resolve) => {
            this.promptEmbed.setTitle(`Prompt ${parseInt(i) + 1} of ${this.gamePrompts.length}`);
            this.promptEmbed.setDescription(this.gamePrompts[i]);

            const playersWithPrompts = this.assignedPrompts.filter(p => p.includes(this.gamePrompts[i])).firstKey(2);

            this.promptEmbed.addFields([{
                name: "1️⃣: ???",
                value: this.completedPrompts.get(playersWithPrompts[0])[this.assignedPrompts.get(playersWithPrompts[0]).indexOf(this.gamePrompts[i])],
                inline: true
            }, {
                name: "2️⃣: ???",
                value: this.completedPrompts.get(playersWithPrompts[1])[this.assignedPrompts.get(playersWithPrompts[1]).indexOf(this.gamePrompts[i])],
                inline: true
            }]);

            await this.promptMessage.edit(this.promptEmbed);
        });
    }
}