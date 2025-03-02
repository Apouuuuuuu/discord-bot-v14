require("dotenv").config(); // Charge les variables d'environnement
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

// Vérifie si la variable TOKEN est définie
if (!process.env.TOKEN) {
    console.error("❌ ERREUR : Le token du bot n'est pas défini !");
    process.exit(1); // Stoppe le bot si le token est manquant
}

loadCommands(bot);
loadEvents(bot);

bot.login(process.env.TOKEN);
