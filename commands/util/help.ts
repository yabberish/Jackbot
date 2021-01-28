import {Message, MessageEmbed} from "discord.js";
import {Command, CommandGroup, CommandoMessage} from "discord.js-commando";
import Jackbot from "../../Jackbot";

export default class HelpCommand extends Command {
  client: Jackbot;

  constructor(client: Jackbot) {
    super(client, {
      name: "help",
      aliases: [
        "commands",
        "cmds"
      ],
      group: "util",
      memberName: "help",
      description: "Shows a list of commands",
      details: "This command is used to show information about a command, a group, or to show all of the commands available to you.",
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

  run(message, args: {command?: Command | CommandGroup}): Promise<Message> {
    const embed = new MessageEmbed();
    embed.setColor("RANDOM");
    embed.setThumbnail("https://jackboxgames.b-cdn.net/wp-content/uploads/2019/07/Blue.gif");
    embed.setFooter(`Command executed by ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}));
    if (!args.command) {
      embed.setTitle(`${this.client.user.username}: Help`);
      embed.addFields(this.client.registry.groups.map(group => ({
        name: group.name,
        value: group.commands
          .filter(command => command.hasPermission(message) === true)
          .map(command => this.getPrefixedCommandName(command, message)).join(", "),
        inline: true
      })));
      
    } else if (args.command instanceof CommandGroup) {
      embed.setTitle(`${args.command.name} (${args.command.id})`);
      embed.addFields(args.command.commands.filter(command => command.hasPermission(message) === true).map(command => ({
        name: this.getPrefixedCommandName(command, message),
        value: command.description,
        inline: true
      })));

    } else if (args.command instanceof Command) {
      embed.setTitle(`${this.getPrefixedCommandName(args.command, message)} (${args.command.groupID}:${args.command.memberName})`);
      embed.setDescription(args.command.details || args.command.description);
      if (args.command.aliases.length > 0) embed.addField("Aliases", args.command.aliases.join(", "), true);
      embed.addField("Usage", `${this.getPrefixedCommandName(args.command, message)}${args.command.format ? " " + args.command.format : ""}`, true);
      if (args.command.examples && args.command.examples.length > 0) embed.addField("Examples", args.command.examples.map(example => this.client.commandPrefix + example).join("\n"));
    }
    return message.channel.send(embed);
  }

  getPrefixedCommandName(command: Command, message: CommandoMessage): string {
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

  }
}