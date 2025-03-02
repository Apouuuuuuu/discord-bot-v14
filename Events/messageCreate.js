const { EmbedBuilder } = require("discord.js");


const forbiddenRegex = /\b(n[éeèe3]g[rv]?[o0]s?|b[0o]ugn[0o]u[l1]e?s?)\b/gi;

module.exports = async (bot, message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    const logChannel = message.guild.channels.cache.get('1345549844852379772'); 

    // --- FILTRE ANTI-RACISME ---
    if (forbiddenRegex.test(message.content)) {
        await message.delete().catch(console.error);
        
        let warnEmbed = new EmbedBuilder()
            .setColor("DarkRed")
            .setTitle("🚨 Message supprimé (Propos interdits)")
            .addFields(
                { name: '▶️ Auteur :', value: `\`\`\`${message.author.tag}\`\`\`` },
                { name: '▶️ Contenu :', value: `\`\`\`${message.content}\`\`\`` },
                { name: '▶️ Channel :', value: `<#${message.channel.id}>` }
            )
            .setTimestamp()
            .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) });

        if (logChannel) {
            logChannel.send({ embeds: [warnEmbed] }).catch(console.error);
        } else {
            console.log("⚠️ Le channel des logs est introuvable !");
        }

        console.log(`❌ Message supprimé de ${message.author.tag} : "${message.content}"`);
        return;
    }

    // --- LOG DES MESSAGES ENVOYÉS ---
    let EmbedMsgLogs = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📩 Message envoyé")
        .addFields(
            { name: '▶️ Auteur :', value: `\`\`\`${message.author.tag}\`\`\`` },
            { name: '▶️ Contenu :', value: `\`\`\`${message.content || "Aucun contenu"}\`\`\`` },
            { name: '▶️ Channel :', value: `<#${message.channel.id}>` }
        )
        .setTimestamp()
        .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) });

    if (logChannel) {
        logChannel.send({ embeds: [EmbedMsgLogs] }).catch(console.error);
    } else {
        console.log("⚠️ Le channel des logs est introuvable !");
    }

    // --- COMMANDE +SNIPE ---
    if (message.content === "+snipe") {
        const snipedMessage = bot.lastDeletedMessage.get(message.channel.id);

        if (!snipedMessage) {
            return message.channel.send("❌ Aucun message supprimé à afficher !");
        }

        const snipeEmbed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("💬 Dernier message supprimé")
            .addFields(
                { name: '▶️ Auteur :', value: `\`\`\`${snipedMessage.author}\`\`\`` },
                { name: '▶️ Contenu :', value: `\`\`\`${snipedMessage.content}\`\`\`` },
                { name: '▶️ Supprimé à :', value: `<t:${Math.floor(snipedMessage.timestamp / 1000)}:F>` }
            )
            .setTimestamp()
            .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) });

        message.channel.send({ embeds: [snipeEmbed] }).catch(console.error);
    }
};
