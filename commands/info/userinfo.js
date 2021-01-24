const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class UserInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      aliases: [
        'uinfo',
        'whois'
      ],
      group: 'general',
      memberName: 'userinfo',
      description: 'View information on a user',
      guildOnly: true,
      details: `
        If no user is provided, it will give information on the user who ran the command.
      `,
      examples: [
        'userinfo @user',
        'userinfo'
      ]
    })
  }

  async run(message) {
        const { guild, channel } = message

        const user = message.mentions.users.first() || message.member.user
        const member = guild.members.cache.get(user.id)

        const embed = new MessageEmbed()
            embed.setColor('2F3136')
            embed.setAuthor(`Info || ${user.username}`, user.displayAvatarURL())
            embed.setThumbnail(user.displayAvatarURL())
            embed.addFields(
            {
                name: 'User tag',
                value: user.tag,
                inline: true
            },
            {
                name: 'ID',
                value: user.id,
                inline: true
            },
            {
                name: 'Nickname',
                value: member.nickname || 'None',
            },
            {
                name: 'Joined Server',
                value: new Date(member.joinedTimestamp).toLocaleDateString(),
                inline: true
            },
            {
                name: 'Created At',
                value: new Date(user.createdTimestamp).toLocaleDateString(),
                inline: true
            },
            {
                name: 'Role Count',
                value: member.roles.cache.size - 1,
            }, {
                name: 'Highest Role',
                value: member.roles.highest
            })
            embed.setFooter(`Command issued by ${user.tag}`, user.displayAvatarURL())
        message.channel.send(embed)
}
}

module.exports = UserInfoCommand
