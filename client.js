const { Client, Intents } = require("discord.js");

const client = new Client({
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