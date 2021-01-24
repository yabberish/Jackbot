const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const { version } = require('../../package.json')

class BotInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'botinfo',
      aliases: [
        'binfo'
      ],
      group: 'info',
      memberName: 'botinfo',
      description: 'View information on the bot',
      guildOnly: true
    })
  }

  async run(message) {
    const embed = new MessageEmbed
            embed.setColor('2F3136')
            embed.setAuthor(`Info || ${this.client.user.tag}`, this.client.user.displayAvatarURL())
            embed.setThumbnail(this.client.user.displayAvatarURL())
            embed.addFields({
                name: 'Name',
                value: this.client.user.tag,
                inline: true
            }, {
                name: 'Version',
                value: version,
                inline: true
            }, {
                name: 'Prefix',
                value: "mf!",
            }, {
                name: 'Server Count',
                value: this.client.guilds.cache.size,
                inline: true
            }, {
                name: 'Total Members',
                value: message.guild.memberCount
            })
            embed.setFooter(`Command issued by ${message.member.user.tag}`, message.member.user.displayAvatarURL())
        message.channel.send(embed)
  }
}

module.exports = BotInfoCommand
