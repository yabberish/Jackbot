const { Collection, MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");

const prompts = require("../../prompts.json");

class QuiplashCommand extends Command {
  constructor(client) {
    super(client, {
      name: "quiplash",
      group: "game",
      memberName: "quiplash",
      description: "Starts a game of Quiplash",
      clientPermissions: [
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "MANAGE_CHANNELS",
        "EMBED_LINKS",
        "ADD_REACTIONS"
      ],
      guildOnly: true
    });
  }

  async run(message) {
    const embed = new MessageEmbed();
    embed.setTitle("Quiplash!");
    embed.setDescription("A game of **Quiplash!** is starting now!\n\nReact with <:play:802035201445199883> in the next 45 seconds to join!\n0/8 players in game");
    embed.setFooter("Game started by " + message.author.tag, message.author.displayAvatarURL({dynamic: true}));
    embed.setColor("RANDOM");
    embed.setThumbnail("https://jackboxgames.b-cdn.net/wp-content/uploads/2019/07/Red.gif");
    embed.setTimestamp();
    let joinMessage = await message.channel.send(embed);
    joinMessage.react("802035201445199883").catch(console.error);

    const collector = joinMessage.createReactionCollector((reaction, user) => reaction.emoji.id === "802035201445199883" && !user.bot, {
      time: 45000,
      maxUsers: 8,
      dispose: true
    });

    collector.on("collect", (reaction, user) => {
      user.createDM().then(dm => dm.send("You have joined the game of **Quiplash!** in " + message.guild.name + "!")).catch(() => {
        message.channel.send(`${user}, you need to have your DM's open in order to join this game.`);
        reaction.users.remove(user);
      });
      embed.setDescription(`A game of **Quiplash!** is starting now!\n\nReact with <:play:802035201445199883> in the next 45 seconds to join!\n${collector.collected.get("802035201445199883").count - 1}/8 players in game`);
      joinMessage.edit(embed).catch(console.error);
    });

    collector.on("remove", (reaction, user) => {
      user.createDM().then(dm => dm.send("You have left the game of **Quiplash!** in " + message.guild.name + "!"));
      embed.setDescription(`A game of **Quiplash!** is starting now!\n\nReact with <:play:802035201445199883> in the next 45 seconds to join!\n${collector.collected.has("802035201445199883") ? collector.collected.get("802035201445199883").count - 1 : 0}/8 players in game`);
      joinMessage.edit(embed).catch(console.error);
    });

    collector.on("end", async collected => {
      joinMessage.delete().catch(console.error);

      if (collected.has("802035201445199883") && collected.get("802035201445199883").count - 1 >= 3) {
        embed.setDescription("Sending prompts, please wait...");
      } else {
        embed.setDescription("This game has ended: 3 or more players required.");
        embed.setThumbnail(null);
        return message.channel.send(embed).catch(console.error);
      }

      const players = collected.get("802035201445199883").users.cache.filter(u => !u.bot);
      const assignedPrompts = new Collection(players.map(u => [u.id, []]));
      const completedPrompts = new Collection(players.map(u => [u.id, []]));

      joinMessage = await message.channel.send(embed).catch(console.error);

      const gamePrompts = prompts.filter(p => !p.nsfw).sort(() => 0.5 - Math.random()).slice(0, players.size);

      for (let i in gamePrompts) {
        i = parseInt(i);
        let apa = assignedPrompts.array();
        apa[i].push(gamePrompts[i]);
        apa[i + 1 < players.size ? i + 1 : 0].push(gamePrompts[i]);
      }

      const category = await message.guild.channels.create("Jackbox", {type: 'category' });
      const channel = await message.guild.channels.create("quiplash", {parent: category.id});
      

      let finished = 0;

      players.forEach(async player => {
        if (player.bot) return;

        const dm = await player.createDM();

        const dmEmbed = new MessageEmbed();
        dmEmbed.setTitle("Prompt 1 of 2:");
        dmEmbed.setDescription(assignedPrompts.get(player.id)[0].prompt);
        dmEmbed.setFooter("Respond to this message with your prompt.");
        dmEmbed.setColor("RANDOM");
    
        dm.send(dmEmbed).catch(console.error);

        const mcollector = dm.createMessageCollector(m => m.author.id === player.id, {
          max: 2,
          time: 90000
        });

        mcollector.on("collect", message => {
          completedPrompts.get(message.author.id).push(message.content);
          if (completedPrompts.get(message.author.id).length === 1) {
            dmEmbed.setTitle("Prompt 2 of 2:");
            dmEmbed.setDescription(assignedPrompts.get(player.id)[1].prompt);
            dm.send(dmEmbed);
          }
        });

        mcollector.on("end", () => {
          dmEmbed.setTitle("Finished")
          dmEmbed.setDescription(`Get ready to vote for your favorite prompts in ${channel}!`);
          dmEmbed.footer = null;
          dm.send(dmEmbed);
          onFinish();
        });

      });

      embed.setDescription(`Prompts have been sent! You have 90 seconds to answer your prompts.\n\nAfter the time is up, vote for your favorite prompts in ${channel}`);

      joinMessage.edit(embed).catch(console.error);

      const promptEmbed = new MessageEmbed();
      promptEmbed.setColor("RANDOM");
      promptEmbed.setFooter("Vote for your favorite response below! You have 15 seconds.");

      let currentPromptMessage;

      const onFinish = async () => {
        finished++;
        if (finished >= players.size) {
          embed.setDescription(`Everyone has finished their prompts!\n\nChoose your favorite response in ${channel}!`);
          joinMessage.delete().catch(console.error);
          joinMessage = await message.channel.send(embed).catch(console.error);
          currentPromptMessage = await channel.send(promptEmbed);
          await sendPrompt();
        }
      }

      let currentPrompt = 0;
      const sendPrompt = async () => {
        const prompt = gamePrompts[currentPrompt];
        promptEmbed.setTitle(`Prompt ${++currentPrompt}/${gamePrompts.length}`);
        promptEmbed.setDescription(prompt.prompt);
        const filteredPrompts = assignedPrompts.filter(p => p.includes(prompt));
        const playersWithPrompts = filteredPrompts.firstKey(2);

        promptEmbed.addFields([{
          name: "1️⃣: ???",
          value: completedPrompts.get(playersWithPrompts[0])[filteredPrompts.get(playersWithPrompts[0]).indexOf(prompt)],
          inline: true
        },{
          name: "2️⃣: ???",
          value: completedPrompts.get(playersWithPrompts[1])[filteredPrompts.get(playersWithPrompts[1]).indexOf(prompt)],
          inline: true
        }]);
        currentPromptMessage.edit(promptEmbed);
        currentPromptMessage.react("1️⃣");
        currentPromptMessage.react("2️⃣");
        const voteCollector = currentPromptMessage.createReactionCollector((reaction, user) => {return (["1️⃣","2️⃣"]).includes(reaction.emoji.name) && !user.bot}, {
          time: 15000
        });

        let first = [];
        let second = [];

        voteCollector.on("collect", (reaction, user) => {
          if (!first.includes(user.id) && !second.includes(user.id)) switch (reaction.emoji.name) {
            case "1️⃣":
              first.push(user.id);
              break;
            case "2️⃣":
              second.push(user.id);
              break;
          }
          reaction.users.remove(user);
        });

        voteCollector.on("end", () => {
          currentPromptMessage.reactions.removeAll();
          promptEmbed.spliceFields(0, 2, {
            name: `1️⃣: ${client.users.resolve(playersWithPrompts[0])} (${Math.floor((first.length / (first.length + second.length)) * 100)}%)`,
            value: completedPrompts.get(playersWithPrompts  [0])[filteredPrompts.get(playersWithPrompts[0]) .indexOf(prompt)],
            inline: true
          },{
            name: `2️⃣: ${client.users.resolve(playersWithPrompts[1])} (${Math.floor((second.length / (first.length + second.length)) * 100)}%)`,
            value: completedPrompts.get(playersWithPrompts  [1])[filteredPrompts.get(playersWithPrompts[1]) .indexOf(prompt)],
            inline: true
          });
          currentPromptMessage.edit(promptEmbed);
        });
      }
    });
  }
}


module.exports = QuiplashCommand;