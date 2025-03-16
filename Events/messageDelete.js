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

    let imageURLs = [];

    if (message.attachments.size > 0) {
        const allowedExtensions = ["png", "jpg", "jpeg", "gif", "webp"];
        const imageAttachments = message.attachments.filter(attachment => {
            const cleanUrl = attachment.url.split('?')[0];
            const ext = cleanUrl.split('.').pop().toLowerCase();
            return allowedExtensions.includes(ext);
        });

        if (imageAttachments.size > 0) {
            imageURLs = Array.from(imageAttachments.values()).map(att => att.url);

            const firstImage = imageAttachments.first();
            deletionEmbed.setImage(firstImage.url);
            deletionEmbed.addFields({ name: '▶️ Image', value: `[Voir l'image](${firstImage.url})` });

            if (imageAttachments.size > 1) {
                const additionalImages = imageAttachments.filter(att => att.id !== firstImage.id)
                    .map(att => `[Voir l'image](${att.url})`)
                    .join("\n");
                deletionEmbed.addFields({ name: '▶️ Autres images', value: additionalImages });
            }
        }
    }

    logChannel.send({ embeds: [deletionEmbed] }).catch(console.error);

    bot.lastDeletedMessage.set(message.channel.id, {
        author: message.author.tag,
        content: message.content,
        timestamp: message.createdTimestamp,
        type: "user",
        images: imageURLs
    });
};