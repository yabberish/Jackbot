const { Intents } = require("discord.js");
const { CommandoClient } = require("discord.js-commando");

const client = new CommandoClient({,
  owner: [
    "474016258019557377",
    "738604939957239930"
  ],
  commandPrefix: "j!",
  invite: "",
  ws: {
    intents: Intents.NON_PRIVILEGED
  },
  partials: [
    "CHANNEL",
    "GUILD_MEMBER",
    "MESSAGE",
    "REACTION",
    "USER"
  ]
});

client.on("debug", console.debug);
client.login();