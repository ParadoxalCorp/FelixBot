module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            resolve(message.channel.createMessage({
                embed: {
                    title: `Farewell settings`,
                    description: "```\n" + (guildEntry.onEvent.guildMemberRemove.farewell.message ? guildEntry.onEvent.guildMemberRemove.farewell.message : "Seems like there is no farewell message set yet") + "```",
                    fields: [{
                        name: `Enabled`,
                        value: guildEntry.onEvent.guildMemberRemove.farewell.enabled ? `:white_check_mark:` : `:x:`,
                        inline: true
                    }, {
                        name: `Target`,
                        value: guildEntry.onEvent.guildMemberRemove.farewell.channel ? (message.guild.channels.get(guildEntry.onEvent.guildMemberRemove.farewell.channel) ? `#${message.guild.channels.get(guildEntry.onEvent.guildMemberRemove.farewell.channel).name}` : "#deleted-channel") : "None set, greetings message won't be sent",
                        inline: true
                    }]
                }
            }))
        } catch (err) {
            reject(err);
        }
    })
}