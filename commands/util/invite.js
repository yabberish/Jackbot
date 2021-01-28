const {MessageEmbed} = require("discord.js");
const {Command} = require("discord.js-commando");

class InviteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "invite",
      group: "util",
      memberName: "invite",
      description: "Sends the invite for the bot"
    });
  }
  
  async run(message) {
    const embed = new MessageEmbed();
    embed.setTitle(`Add ${this.client.user.username} to your server!`);
    embed.setColor("RANDOM");
    embed.setDescription(`[Click here!](${await this.client.generateInvite(["MANAGE_CHANNELS", "ADD_REACTIONS", "VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS", "MANAGE_ROLES"])})`);
    message.channel.send(embed);
  }
}

module.exports = InviteCommand;