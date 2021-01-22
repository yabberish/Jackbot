require("dotenv").config();

const path = require("path");

const { ShardingManager } = require("discord.js");

const manager = new ShardingManager(path.join(__dirname, "client.js"), {
  token: process.env.DISCORD_TOKEN
});

manager.spawn();