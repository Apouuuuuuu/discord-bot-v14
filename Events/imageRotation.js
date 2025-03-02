const { Client } = require("discord.js");
const axios = require("axios");

const IMAGE_CHANNEL_ID = "1345556592774353008"; 
const USED_IMAGES = new Set();
const MAX_IMAGE_SIZE_MB = 10; // taille max d'image par discord

async function fetchImages(bot) {
    const channel = await bot.channels.fetch(IMAGE_CHANNEL_ID);
    if (!channel) return console.error("❌ Impossible de trouver le salon des images.");

    const messages = await channel.messages.fetch({ limit: 50 });
    const images = messages
        .filter(msg => msg.attachments.size > 0)
        .map(msg => ({
            url: msg.attachments.first().url,
            size: msg.attachments.first().size / (1024 * 1024), 
            message: msg 
        }));

    return images.filter(img => !USED_IMAGES.has(img.url));
}

async function rotateImage(bot) {
    console.log("🔄 Vérification des images pour rotation...");
    const images = await fetchImages(bot);

    if (images.length === 0) {
        console.log("⏸️ Toutes les images ont été utilisées, en attente de nouvelles...");
        return;
    }

    const image = images[Math.floor(Math.random() * images.length)];
    USED_IMAGES.add(image.url);

    // Vérifier si l'image dépasse la taille autorisée
    if (image.size > MAX_IMAGE_SIZE_MB) {
        console.log(`❌ Image trop lourde (${image.size.toFixed(2)} Mo), ignorée.`);
        
        try {
            await image.message.reply(`❌ Image trop lourde pour être importée (${MAX_IMAGE_SIZE_MB} < ${image.size.toFixed(2)} Mo).`);
        } catch (err) {
            console.error("❌ Impossible de répondre à l'utilisateur :", err);
        }

        return;
    }

    try {
        const response = await axios.get(image.url, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data, "binary");

        await bot.guilds.cache.first().setIcon(imageBuffer);
        console.log("✅ Photo de profil mise à jour !");
    } catch (error) {
        console.error("❌ Erreur lors du changement de photo de profil :", error);
    }
}

module.exports = (bot) => {
    setInterval(() => rotateImage(bot), 5000);
};
