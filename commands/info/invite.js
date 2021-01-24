const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      group: 'info',
      memberName: 'invite',
      description: `Get an invite link for the bot` 
    })
  }

  async run(message) {
    const embed = new MessageEmbed
    embed.setColor('2F3136')
    embed.setDescription(`[**Invite ${this.client.user.username}
    **](${await this.client.generateInvite({
      permissions: ["ADMINISTRATOR"]
    })})`);
    message.channel.send(embed)
  }
}

module.exports = InviteCommand
