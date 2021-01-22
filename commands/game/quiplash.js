const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");

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
    const joinMessage = await message.channel.send(embed);
    joinMessage.react("<:play:802035201445199883>");

    const collector = joinMessage.createReactionCollector((reaction, user) => reaction.emoji.id === "802035201445199883" && !user.bot, {
      time: 45000,
      maxUsers: 8,
      dispose: true
    });

    collector.on("collect", (reaction, user) => {
      user.createDM().then(dm => dm.send("You have joined the game of **Quiplash!** in " + message.guild.name + "!"));
      embed.setDescription(`A game of **Quiplash!** is starting now!\n\nReact with <:play:802035201445199883> in the next 45 seconds to join!\n${collector.collected.get("802035201445199883").count - 1}/8 players in game`);
      joinMessage.edit(embed).catch(console.error);
    });

    collector.on("remove", (reaction, user) => {
      user.createDM().then(dm => dm.send("You have left the game of **Quiplash!** in " + message.guild.name + "!"));
      embed.setDescription(`A game of **Quiplash!** is starting now!\n\nReact with <:play:802035201445199883> in the next 45 seconds to join!\n${collector.collected.has("802035201445199883") ? collector.collected.get("802035201445199883").count - 1 : 0}/8 players in game`);
      joinMessage.edit(embed).catch(console.error);
    });

    collector.on("end", collected => {
      if (!collected.has("802035201445199883") || collected.get("802035201445199883").count < 3) return message.channel.send("<:error:802043137740374074> I've failed to start a game of **Quiplash!**: 3 or more players are required to start.")

      message.channel.send("Starting game of **Quiplash!** with " + (collected.get("802035201445199883").count - 1) + " people!");
    });
  }
}


module.exports = QuiplashCommand;