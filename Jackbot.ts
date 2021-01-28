import * as path from "path";

import {Collection, Intents, Snowflake} from "discord.js";
import { CommandoClient, SQLiteProvider } from "discord.js-commando";
import * as sqlite from "sqlite";
import { Database } from "sqlite3";
import QuiplashGame from "./games/QuiplashGame";

export default class Jackbot extends CommandoClient {
    games = {
        quiplash: new Collection<Snowflake, QuiplashGame>()
    }

    constructor() {
        super({
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

        this.registry.registerGroups([
            ["game", "Game"]
        ]);
        this.registry.registerDefaultGroups();
        this.registry.registerDefaultTypes();
        this.registry.registerDefaultCommands({
            help: false,
            unknownCommand: false
        });
        this.registry.registerCommandsIn(path.join(__dirname, "commands"));

        this.setProvider(sqlite.open({
            filename: path.join(__dirname, "sqlite.db"),
            driver: Database
        }).then(db => new SQLiteProvider(db))).catch(console.error);

        this.on("debug", console.debug);

        this.login().catch(console.error);
    }
}