const axios = require("axios");

const IMAGE_CHANNEL_ID = "1345566819909369936"; 
const GUILD_ID = "1343890230394093588"; 
const USED_IMAGES = new Set();
const MAX_IMAGE_SIZE_MB = 10; 
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"]; 

async function fetchTenorImage(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const match = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
        if (match && match[1]) {
            return match[1];
        } else {
            console.log("❌ Aucun og:image trouvé sur la page Tenor.");
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'image Tenor :", error.message);
    }

    const img = document.getElementById("tenor-preview");
    if (img) {
        img.remove();
        console.log("🗑️ Image supprimée suite à l'échec de récupération.");
    }

    return null;
}

async function fetchImages(bot) {
    const channel = await bot.channels.fetch(IMAGE_CHANNEL_ID);
    if (!channel) {
        console.error("❌ Impossible de trouver le salon des images.");
        return [];
    }
    console.log(`✅ Salon d'images trouvé : ${channel.name} (${channel.id})`);

    const messages = await channel.messages.fetch({ limit: 100 });
    let images = [];

    messages.forEach(msg => {
        if (msg.attachments.size > 0) {
            msg.attachments.forEach(attachment => {
                const cleanUrl = attachment.url.split('?')[0];
                const fileExtension = cleanUrl.split('.').pop().toLowerCase();
                if (ALLOWED_EXTENSIONS.includes(fileExtension) && !USED_IMAGES.has(attachment.url)) {
                    console.log(`📸 Image détectée (attachment) : ${attachment.url}`);
                    images.push({
                        url: attachment.url,
                        size: attachment.size / (1024 * 1024), // Conversion en Mo
                        extension: fileExtension,
                        message: msg
                    });
                }
            });
        }
    });

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let promises = [];
    messages.forEach(msg => {
        const urls = msg.content.match(urlRegex);
        if (urls) {
            urls.forEach(url => {
                if (USED_IMAGES.has(url)) return;
                const cleanUrl = url.split('?')[0];
                let fileExtension = cleanUrl.split('.').pop().toLowerCase();
                if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
                    console.log(`📸 Image détectée (URL direct) : ${url}`);
                    images.push({
                        url: url,
                        size: 0,
                        extension: fileExtension,
                        message: msg
                    });
                } else if (url.includes("tenor.com")) {
                    const promise = (async () => {
                        const tenorImage = await fetchTenorImage(url);
                        if (tenorImage && !USED_IMAGES.has(tenorImage)) {
                            console.log(`📸 Image détectée (Tenor) : ${tenorImage}`);
                            let sizeMB = 0;
                            try {
                                const headResp = await axios.head(tenorImage);
                                const contentLength = headResp.headers["content-length"];
                                if (contentLength) {
                                    sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
                                }
                            } catch (error) {
                                console.error("❌ Erreur lors de la récupération de la taille de l'image Tenor, utilisation de 0 Mo :", error.message);
                                sizeMB = 0;
                            }
                            images.push({
                                url: tenorImage,
                                size: sizeMB,
                                extension: "gif",
                                message: msg
                            });
                        }
                    })();
                    promises.push(promise);
                }
            });
        }
    });

    await Promise.all(promises);

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

        const dataUri = `data:image/${image.extension};base64,${imageBuffer.toString("base64")}`;

        await guild.setIcon(dataUri);
        console.log("✅ Changement de l'icône réussi !");

        await image.message.delete();
        console.log("🗑️ Message supprimé pour éviter la réutilisation de l'image.");
    } catch (error) {
        console.error("❌ Erreur lors du changement de photo de profil :", error.message);
    }
}

module.exports = (bot) => {
    console.log("⏳ Lancement de la rotation d'images toutes les 1h hors période 00:00-10:00");
    setInterval(() => {
        const now = new Date();
        const currentHour = now.getHours();
        if (currentHour >= 0 && currentHour < 10) {
            console.log("⏸️ Rotation des images désactivée entre minuit et 10h.");
            return;
        }
        rotateImage(bot);
    }, 7200000);
};
