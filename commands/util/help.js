const {MessageEmbed} = require("discord.js");
const {Command, CommandGroup} = require("discord.js-commando");

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      aliases: [
        "commands",
        "cmds"
      ],
      group: "util",
      memberName: "help",
      description: "Shows a list of commands",
      details: "This command is used to show information about a command, a group, or to show all of the commands avaliable to you.",
      examples: [
        "help",
        "help quiplash",
        "help prefix"
      ],
      clientPermissions: [
        "SEND_MESSAGES",
        "EMBED_LINKS"
      ],
      args: [
        {
          key: "command",
          label: "command or group",
          prompt: "Enter a command or group",
          type: "command|group",
          default: ""
        }
      ],
      guarded: true
    })
  }

  run(message, args) {
    const embed = new MessageEmbed();
    embed.setColor("RANDOM");
    embed.setThumbnail("https://jackboxgames.b-cdn.net/wp-content/uploads/2019/07/Blue.gif");
    embed.setFooter("Command executed by " + message.author.tag, message.author.displayAvatarURL({dynamic: true}));
    if (args.command === "") {
      embed.setTitle(this.client.user.username + ": Help");
      try {
      embed.addFields(this.client.registry.groups.map(group => ({
        name: group.name,
        value: group.commands
          .filter(command => command.hasPermission(message))
          .map(command => {
            let prefix;
            if (message.channel.type === "dm") {
              prefix = "";
            } else if (message.guild.commandPrefix) {
              prefix = message.guild.commandPrefix;
            } else if (message.guild.commandPrefix === null) {
              prefix = this.client.commandPrefix;
            } else if (message.guild.commandPrefix === "") {
              prefix = `${this.client.user} `;
            }
            return prefix + command.name;
          }).join(", "),
        inline: true
      })));
      } catch (err) {console.error(err)};
      
    } else if (args.command instanceof CommandGroup) {
      embed.setTitle(`${args.command.name} (${args.command.id})`);
      embed.addFields(args.command.commands.filter(command => !!this.client.owners.find(u => u.id === message.author.id) && command.hasPermission(message.author, false)).map(command => ({
        name: this.client.commandPrefix + command.name,
        value: command.description,
        inline: true
      })));
    } else if (args.command instanceof Command) {
      embed.setTitle(`${args.command.name} (${args.command.groupID}:${args.command.memberName})`);
      embed.setDescription(args.command.details);
      if (args.command.aliases.length > 0) embed.addField("Aliases", args.command.aliases.join(", "), true);
      embed.addField("Usage", `${this.client.commandPrefix}${args.command.name}${args.command.format ? " " + args.command.format : ""}`, true);
      if (args.command.examples && args.command.examples.length > 0) embed.addField("Examples", args.command.examples.map(example => this.client.commandPrefix + example).join("\n"));
    }
    message.channel.send(embed);
  }
}

module.exports = HelpCommand;
