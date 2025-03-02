const Discord = require("discord.js")

module.exports = async (bot, interaction) => {

    if(interaction.type ===  Discord.InteractionType.ApplicationCommandAutocomplete) {
        let entry = interaction.options.getFocused()
        
        if(interaction.commandName === "help") {
            let choices = bot.commands.filter(cmd => cmd.name.includes(entry))
            await interaction.respond(entry === "" ? bot.commands.map(cmd => ({name: cmd.name, value: cmd.name})) : choices.map(choice => ({name: choice.name, value: choice.name})))
        }
        
        if(interaction.commandName === "roles") {
            let choices = ["add", "remove"]
            let sortie = choices.filter(c => c.includes(entry))
            await interaction.respond(entry === "" ? sortie.map(c => ({name: c, value: c})) : sortie.map(c => ({name: c, value: c})))
        }
    }

    if (interaction.type === Discord.InteractionType.ApplicationCommand) {
        let command = require(`../Commandes/${interaction.commandName}`)
        command.run(bot, interaction, interaction.options, bot.db)
    }


    // if (interaction.isCommand()) {
    //     let EmbedCommandLogs = new Discord.EmbedBuilder()
    //         .setColor(bot.colorInformation)
    //         .setTitle("Logs")
    //         .setDescription(`Commande envoyée`)
    //         .addFields(
    //             { name: '▶️ Auteur :', value: `\`\`\`${interaction.user.tag}\`\`\`` },
    //             { name: '▶️ Contenu :', value: `\`\`\`${interaction.commandName}\`\`\`` },
    //             { name: '▶️ Channel :', value: `<#${interaction.channel.id}>` },
    //             )
    //         .setTimestamp()
    //         .setFooter({text: bot.user.username, iconURL: bot.user.displayAvatarURL({dynamic: true})})
    
    //     let channel = bot.channels.cache.get('1091377161824378921');
    //     channel.send({ embeds: [EmbedCommandLogs] });
    // }
}    