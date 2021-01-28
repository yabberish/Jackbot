import "dotenv/config";

import * as path from "path";

import { ShardingManager } from "discord.js";

const manager = new ShardingManager(path.join(__dirname, "client.js"), {
  token: process.env.DISCORD_TOKEN
});

manager.spawn().catch(console.error);