const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class ChannelInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'channelinfo',
      aliases: [
        'cinfo'
      ],
      group: 'general',
      memberName: 'channelinfo',
      description: 'View information on a channel',
      guildOnly: true,
      details: `
        If no channel is provided, it will give information on the channel the command is run in.
      `,
      examples: [
        'channelinfo #channel',
        'channelinfo'
      ]
    })
  }

  async run(message) {
        const channel = message.mentions.channels.first() || message.channel

        const { guild, id, parent, name, position, rawPosition, createdAt } = channel

        const icon = guild.iconURL()
        const embed = new MessageEmbed
            embed.setColor('2F3136')
            embed.setAuthor(`Info || #${name}`)
            embed.setThumbnail(icon)
            embed.addFields({
                name: 'Name',
                value: `#${name}`,
                inline: true
            }, {
                name: 'ID',
                value: id,
                inline: true
            }, {
                name: 'Parent',
                value: parent,
            }, {
                name: 'Position',
                value: position,
                inline: true
            }, {
                name: 'Raw Position',
                value: rawPosition,
                inline: true
            }, {
                name: 'Created On',
                value: new Date(createdAt).toLocaleDateString(),
            })
            embed.setFooter(`Command issued by ${message.author.tag}`, message.author.displayAvatarURL())
        message.channel.send(embed)
}
}

module.exports = ChannelInfoCommand
