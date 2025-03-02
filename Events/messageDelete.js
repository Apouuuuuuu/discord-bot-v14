module.exports = async (bot, message) => {
    if (!message.author || message.author.bot || !message.content) return;

    bot.lastDeletedMessage.set(message.channel.id, {
        content: message.content,
        author: message.author.tag,
        timestamp: Date.now()
    });
};
