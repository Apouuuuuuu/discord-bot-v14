const { EmbedBuilder } = require("discord.js");

console.log("🚀 messageCreate.js chargé et fonctionnel !");

const forbiddenRegex = /\b(n[éeèe3]g[rv]?[o0]s?|b[0o]ugn[0o]u[l1]e?s?)\b/gi;

module.exports = async (bot, message) => {
    if (message.author.bot || message.channel.type === 'dm') return;
    
    const logChannel = message.guild.channels.cache.get('1345566769829515457');
    
    if (forbiddenRegex.test(message.content)) {
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        let links = message.content.match(linkRegex) || [];
        
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                links.push(attachment.url);
            });
        }
        
        bot.lastDeletedMessage.set(message.channel.id, {
            author: message.author.tag,
            content: message.content,
            timestamp: Date.now(),
            type: "forbidden",
            links: links
        });
        
        await message.delete().catch(console.error);
        
        const warnEmbed = new EmbedBuilder()
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
        
        console.log(`❌ Message supprimé de ${message.author.tag} (propos interdits) : "${message.content}"`);
        return;
    }
    
    if (message.content === "+snipe") {
        const snipedMessage = bot.lastDeletedMessage.get(message.channel.id);
        
        if (!snipedMessage) {
            return message.channel.send("❌ Aucun message supprimé à afficher !");
        }
        
        const snipeEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: snipedMessage.author })
            .setDescription(`\`\`\`${snipedMessage.content ? snipedMessage.content : '*Pas de contenu*'}\`\`\``)
            .setFooter({ text: 'Supprimé le', iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
        
        if (snipedMessage.links && snipedMessage.links.length > 0) {
            const formattedLinks = snipedMessage.links
                .map(link => `[${link}](${link})`)
                .join("\n");
            snipeEmbed.addFields({ name: '▶️ Liens', value: formattedLinks });
        }
        
        message.channel.send({ embeds: [snipeEmbed] }).catch(console.error);
    }
};
