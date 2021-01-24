const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      aliases: [
        'sinfo'
      ],
      group: 'general',
      memberName: 'serverinfo',
      description: 'View information on the server',
      guildOnly: true
    })
  }

  async run(message) {
        const { guild } = message
        
        const { name, nameAcronym, region, memberCount, afkTimeout, createdAt, owner } = guild

        const icon = guild.iconURL({dynamic: true});

        const embed = new MessageEmbed
            embed.setColor('2F3136')
            embed.setAuthor(`Info || ${name}`)
            embed.setThumbnail(icon)
            embed.addFields({
                name: 'Name',
                value: `${name} (${nameAcronym})`,
                inline: true
            }, {
                name: 'Region',
                value: region,
                inline: true
            }, {
                name: 'AFK Timeout',
                value: `${afkTimeout}s`,
                inline: false,
            }, {
                name: "Owner",
                value: owner.toString()
            }, {
                name: 'Created On',
                value: new Date(createdAt).toLocaleDateString(),
                inline: true
            })
            embed.setFooter(`Command issued by ${message.author.tag}`, message.author.displayAvatarURL())
        message.channel.send(embed)
}
}

module.exports = ServerInfoCommand
