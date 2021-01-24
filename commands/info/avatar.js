const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'avatar',
      aliases: [
        'av',
        'pfp'
      ],
      group: 'info',
      memberName: 'avatar',
      description: 'View avatar of a user',
      guildOnly: true,
      details: `
        If no user is provided, it will show the avatar of the user who ran the command.
      `,
      examples: [
        'avatar @user',
        'avatar'
      ]
    })
  }

    async run(message) {
        const user = message.mentions.users.first() || message.member.user

        const embed = new MessageEmbed()
            embed.setImage(user.displayAvatarURL())
            embed.setColor('2F3136')
            embed.setAuthor(`${user.tag} Avatar`)
            message.channel.send(embed) 
}
}

module.exports = AvatarCommand
