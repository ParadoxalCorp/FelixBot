module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            resolve(await message.channel.createMessage({
                embed: {
                    title: `${message.guild.name}'s moderation settings`,
                    fields: [{
                        name: 'Automatic invite filtering',
                        value: guildEntry.moderation.inviteFiltering.enabled ? ':white_check_mark:' : ':x:',
                        inline: true
                    }, {
                        name: 'Warning for invites advertisement',
                        value: guildEntry.moderation.inviteFiltering.warn ? ':white_check_mark:' : ':x:'
                    }, {
                        name: 'White-listed guilds from invite filtering',
                        value: guildEntry.moderation.inviteFiltering.whitelistedGuilds[0] ? '```\n' + guildEntry.moderation.inviteFiltering.whitelistedGuilds.map(g =>
                            (client.guilds.has(g) ? client.guilds.get(g).name + ` (${g})` : g)) + '```' : ':x:'
                    }, {
                        name: 'Advertisement warn message',
                        value: guildEntry.moderation.inviteFiltering.warnMessage ? '```\n' + guildEntry.moderation.inviteFiltering.warnMessage + '```' : ':x:'
                    }, {
                        name: 'Custom muted roles',
                        value: guildEntry.moderation.mutedRoles.filter(r => message.guild.roles.has(r.id))[0] ? '```\n' + guildEntry.moderation.mutedRoles.filter(r =>
                            message.guild.roles.has(r.id)).map(r => `${message.guild.roles.get(r.id).name} | as '${(r.name 
                                ? r.name.replace(/%ROLE%/gim, message.guild.roles.get(r.id).name) 
                                : message.guild.roles.get(r.id).name)}`).join('\n') + '\'```' : ':x:'
                    }]
                }
            }));
        } catch (err) {
            reject(err);
        }
    });
}