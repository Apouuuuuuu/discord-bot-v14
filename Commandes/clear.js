const Discord = require("discord.js");

module.exports = {
    name: "clear",
    description: "Effacer entre 1 et 100 messages",
    permission: Discord.PermissionFlagsBits.ManageMessages,
    dm: false,
    category: "🔰・Modération",
    options: [
        {
            type: 4, // INTEGER
            name: "nombre",
            description: "Le nombre de messages à supprimer (entre 1 et 100)",
            required: true,
            autocomplete: false
        }, 
        {
            type: 7, // CHANNEL
            name: "salon",
            description: "Le salon où effacer les messages",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, interaction) {
        let channel = interaction.options.getChannel("salon") || interaction.channel;
        if (!interaction.guild.channels.cache.get(channel.id)) 
            return interaction.reply({ content: "Le salon spécifié est invalide !", flags: Discord.MessageFlags.Ephemeral });

        let number = interaction.options.getInteger("nombre");
        if (number < 1 || number > 100) 
            return interaction.reply({ content: "Il faut un nombre entre **1** et **100** !", flags: Discord.MessageFlags.Ephemeral });

        await interaction.deferReply({ flags: Discord.MessageFlags.Ephemeral });

        try {
            let deletedMessages = await channel.bulkDelete(number, true);
            
            let embedSupprime = new Discord.EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("🧹 Messages supprimés")
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`✅ **${deletedMessages.size}** messages ont été supprimés dans ${channel}.`)
                .setTimestamp()
                .setFooter({ text: "Clear command" });

            const sentMessage = await interaction.channel.send({ embeds: [embedSupprime] });

            // Supprime l'embed après 5 secondes
            setTimeout(() => {
                sentMessage.delete();
            }, 5000);

        } catch (err) {
            console.error(err);
            return interaction.followUp({ content: "❌ Une erreur est survenue. Vérifie que les messages ont moins de **14 jours**.", flags: Discord.MessageFlags.Ephemeral });
        }
    }
};
