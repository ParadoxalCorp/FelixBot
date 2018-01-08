module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            resolve(message.channel.createMessage({
                embed: {
                    title: `Experience settings`,
                    fields: [{
                        name: `Enabled`,
                        value: guildEntry.levelSystem.enabled ? `:white_check_mark:` : `:x:`,
                        inline: true
                    }, {
                        name: `Level up notifications`,
                        value: guildEntry.levelSystem.levelUpNotif ? (message.guild.channels.get(guildEntry.levelSystem.levelUpNotif) ? `#${message.guild.channels.get(guildEntry.levelSystem.levelUpNotif).name}` : (guildEntry.levelSystem.levelUpNotif === "channel" ? "channel" : (guildEntry.levelSystem.levelUpNotif === "dm" ? "dm" : "#deleted-channel"))) : "Disabled",
                        inline: true
                    }, {
                        name: `Custom level-up message`,
                        value: guildEntry.levelSystem.customNotif ? "```" + guildEntry.levelSystem.customNotif + "```" : ":x:",
                        inline: true
                    }, {
                        name: 'Automatic removal',
                        value: guildEntry.levelSystem.autoRemove ? ":white_check_mark:" : ":x:",
                        inline: true
                    }]
                }
            }))
        } catch (err) {
            reject(err);
        }
    });
}