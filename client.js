const path = require("path");

const { Intents } = require("discord.js");
const { CommandoClient, SQLiteProvider } = require("discord.js-commando");
const sqlite = require("sqlite");
const { Database } = require("sqlite3").verbose();

const client = new CommandoClient({
  owner: [
    "474016258019557377",
    "738604939957239930"
  ],
  commandPrefix: "j!",
  invite: "https://discord.gg/kwkUrpz4ZF",
  ws: {
    intents: Intents.NON_PRIVILEGED
  }
});

client.registry.registerGroups([
  ["game", "Game"]
]);
client.registry.registerDefaultGroups();
client.registry.registerDefaultTypes();
client.registry.registerDefaultCommands({
  help: false,
  unknownCommand: false
});
client.registry.registerCommandsIn(path.join(__dirname, "commands"));

client.setProvider(sqlite.open({
  filename: path.join(__dirname, "sqlite.db"),
  driver: Database
}).then(db => new SQLiteProvider(db))).catch(console.error);

client.on("debug", console.debug);
client.login();