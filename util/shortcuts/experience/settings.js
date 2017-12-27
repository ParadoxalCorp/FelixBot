module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            resolve(message.channel.createMessage({
                embed: {
                    title: `Experience settings`,
                    fields: [{
                        name: `Enabled`,
                        value: guildEntry.generalSettings.levelSystem.enabled ? `:white_check_mark:` : `:x:`,
                        inline: true
                    }, {
                        name: `Level up notifications`,
                        value: guildEntry.generalSettings.levelSystem.levelUpNotif ? (message.guild.channels.get(guildEntry.generalSettings.levelSystem.levelUpNotif) ? `#${message.guild.channels.get(guildEntry.generalSettings.levelSystem.levelUpNotif).name}` : (guildEntry.generalSettings.levelSystem.levelUpNotif === "channel" ? "channel" : (guildEntry.generalSettings.levelSystem.levelUpNotif === "dm" ? "dm" : "#deleted-channel"))) : "Disabled",
                        inline: true
                    }, {
                        name: `Custom level-up message`,
                        value: guildEntry.generalSettings.levelSystem.customNotif ? "```" + guildEntry.generalSettings.levelSystem.customNotif + "```" : ":x:",
                        inline: true
                    }, {
                        name: 'Automatic removal',
                        value: guildEntry.generalSettings.levelSystem.autoRemove ? ":white_check_mark:" : ":x:",
                        inline: true
                    }]
                }
            }))
        } catch (err) {
            reject(err);
        }
    });
}