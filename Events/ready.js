const startImageRotation = require("./imageRotation");

module.exports = async (bot) => {
    console.log(`${bot.user.tag} est bien en ligne.`);
    
    // Démarrer la rotation automatique des images de profil
    startImageRotation(bot);
};
