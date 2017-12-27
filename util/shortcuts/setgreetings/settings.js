module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            resolve(message.channel.createMessage({
                embed: {
                    title: `Greetings settings`,
                    description: "```\n" + (guildEntry.onEvent.guildMemberAdd.greetings.message ? guildEntry.onEvent.guildMemberAdd.greetings.message : "Seems like there is no greetings message set yet") + "```",
                    fields: [{
                        name: `Enabled`,
                        value: guildEntry.onEvent.guildMemberAdd.greetings.enabled ? `:white_check_mark:` : `:x:`,
                        inline: true
                    }, {
                        name: `Target`,
                        value: guildEntry.onEvent.guildMemberAdd.greetings.target === "dm" ? "dm" : (guildEntry.onEvent.guildMemberAdd.greetings.target ? (message.guild.channels.get(guildEntry.onEvent.guildMemberAdd.greetings.target) ? `#${message.guild.channels.get(guildEntry.onEvent.guildMemberAdd.greetings.target).name}` : "#deleted-channel") : "None set, greetings message won't be sent"),
                        inline: true
                    }]
                }
            }))
        } catch (err) {
            reject(err);
        }
    })
}