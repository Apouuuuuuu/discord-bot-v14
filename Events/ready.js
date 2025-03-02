const { REST, Routes } = require("discord.js");

module.exports = async bot => {
    const commands = [...bot.commands.values()].map(command => ({
        name: command.name,
        description: command.description,
        options: command.options || []
    }));

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log("🔄 Mise à jour des slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(bot.user.id, "1292813636405825549"), // ID du serveur
            { body: commands }
        );

        console.log("✅ Slash commands mises à jour avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement des commandes Slash :", error);
    }
};
