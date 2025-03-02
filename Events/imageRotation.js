const axios = require("axios");

const IMAGE_CHANNEL_ID = "1345566819909369936"; 
const GUILD_ID = "1343890230394093588"; // Remplace par l'ID de ton serveur
const USED_IMAGES = new Set();
const MAX_IMAGE_SIZE_MB = 10; // Taille max d'image acceptée par Discord en Mo
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"]; // Formats d'images autorisés

async function fetchImages(bot) {
    const channel = await bot.channels.fetch(IMAGE_CHANNEL_ID);
    if (!channel) {
        console.error("❌ Impossible de trouver le salon des images.");
        return [];
    }
    console.log(`✅ Salon d'images trouvé : ${channel.name} (${channel.id})`);

    // Récupère jusqu'à 100 messages pour maximiser les images disponibles
    const messages = await channel.messages.fetch({ limit: 100 });
    let images = [];

    messages.forEach(msg => {
        if (msg.attachments.size > 0) {
            msg.attachments.forEach(attachment => {
                // Nettoyer l'URL pour retirer les paramètres (après le '?')
                const cleanUrl = attachment.url.split('?')[0];
                const fileExtension = cleanUrl.split('.').pop().toLowerCase();
                if (ALLOWED_EXTENSIONS.includes(fileExtension) && !USED_IMAGES.has(attachment.url)) {
                    console.log(`📸 Image détectée : ${attachment.url}`);
                    images.push({
                        url: attachment.url,
                        size: attachment.size / (1024 * 1024), // Convertir en Mo
                        extension: fileExtension,
                        message: msg
                    });
                }
            });
        }
    });

    console.log(`🔍 Nombre d'images valides trouvées : ${images.length}`);
    return images;
}

async function rotateImage(bot) {
    console.log("🟢 rotateImage() a été appelée !");
    console.log("🔄 Vérification des images pour rotation...");
    const images = await fetchImages(bot);

    if (images.length === 0) {
        console.log("⏸️ Toutes les images ont été utilisées ou ne sont pas valides, en attente de nouvelles...");
        return;
    }

    const image = images[Math.floor(Math.random() * images.length)];
    USED_IMAGES.add(image.url);

    // Vérifier si l'image dépasse la taille autorisée
    if (image.size > MAX_IMAGE_SIZE_MB) {
        console.log(`❌ Image trop lourde (${image.size.toFixed(2)} Mo), ignorée.`);
        try {
            await image.message.reply(`❌ Image trop lourde pour être importée (Max: ${MAX_IMAGE_SIZE_MB} Mo, Actuel: ${image.size.toFixed(2)} Mo).`);
        } catch (err) {
            console.error("❌ Impossible de répondre à l'utilisateur :", err);
        }
        return;
    }

    try {
        const guild = await bot.guilds.fetch(GUILD_ID);
        if (!guild) {
            console.error("❌ Impossible de récupérer le serveur !");
            return;
        }
        console.log(`🖼️ Tentative de changement d'icône avec : ${image.url}`);
        const response = await axios.get(image.url, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data, "binary");

        await guild.setIcon(imageBuffer);
        console.log("✅ Changement de l'icône réussi !");
    } catch (error) {
        console.error("❌ Erreur lors du changement de photo de profil :", error);
    }
}

module.exports = (bot) => {
    console.log("⏳ Lancement de la rotation d'images toutes les 6h secondes...");
    setInterval(() => rotateImage(bot), 21600000);
};
