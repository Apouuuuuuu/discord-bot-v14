require("dotenv").config(); 
const { Client, GatewayIntentBits } = require("discord.js");
const loadCommands = require("./Loaders/loadCommands");
const loadEvents = require("./Loaders/loadEvents");

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const { Collection } = require("discord.js");
bot.commands = new Collection();
bot.lastDeletedMessage = new Map();

if (!process.env.TOKEN) {
    console.error("ERREUR : Le token du bot n'est pas défini !");
    process.exit(1); 
}

loadCommands(bot);
loadEvents(bot);

bot.login(process.env.TOKEN);
