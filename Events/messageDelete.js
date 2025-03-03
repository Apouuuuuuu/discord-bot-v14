const { EmbedBuilder } = require("discord.js");

module.exports = async (bot, message) => {
    if (message.partial || message.author.bot) return;
    if (!message.guild) return;

    const logChannel = message.guild.channels.cache.get('1345566769829515457');
    if (!logChannel) return;

    const storedMessage = bot.lastDeletedMessage.get(message.channel.id);
    if (storedMessage && storedMessage.content === message.content && storedMessage.author === message.author.tag) {
        return;
    }

    const deletionEmbed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("📤 Message supprimé")
        .addFields(
            { name: '▶️ Auteur :', value: `\`\`\`${message.author.tag}\`\`\`` },
            { name: '▶️ Contenu :', value: `\`\`\`${message.content || "Aucun contenu"}\`\`\`` },
            { name: '▶️ Channel :', value: `<#${message.channel.id}>` }
        )
        .setTimestamp()
        .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) });

    logChannel.send({ embeds: [deletionEmbed] }).catch(console.error);

    bot.lastDeletedMessage.set(message.channel.id, {
        author: message.author.tag,
        content: message.content || "Aucun contenu",
        timestamp: message.createdTimestamp,
        type: "user"
    });
};
