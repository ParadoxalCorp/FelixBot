const ModerationHandler = require('../util/helpers/moderationHandler');

module.exports = async(client, guild, user) => {
    const guildData = client.guildData.get(guild.id);
    const memberData = guildData.moderation.users.find(u => u.id === user.id);
    if (guildData.moderation.warns.actions[memberData.warns.length]) {
        switch (guildData.moderation.warns.actions[memberData.warns.length].action) {
            case 'mute':
                const customMutedRole = guildData.moderation.mutedRoles.find(r => r.id === guildData.moderation.warns.actions[memberData.warns.length].customMutedRole) || guildData.moderation.mutedRoles[0];
                if (!customMutedRole && !guild.roles.find(r => r.name === "muted")) return;
                guild.members.get(user.id).addRole(customMutedRole || guild.roles.find(r => r.name === "muted").id, `Has been warned ${memberData.warns.length} times`)
                    .then(async() => {
                        await ModerationHandler.registerCase(client, {
                            guild: guild,
                            user: user,
                            moderator: client.user,
                            color: 0xffcc00,
                            action: customMutedRole ? ('Automatic ' + `${(customMutedRole.name ? customMutedRole.name.replace(/%ROLE%/gim, guild.roles.get(customMutedRole.id).name) : guild.roles.get(customMutedRole.id).name)}`) : 'Automatic-mute',
                            reason: `Has been warned ${memberData.warns.length} times`,
                            performedAction: customMutedRole ? `Has been automatically ${customMutedRole.name === "%ROLE%" ? guild.roles.get(customMutedRole).name : customMutedRole.name} muted` : `Has been automatically muted`

                        }).catch(err => {
                            return console.log(err, `^ ${guild.id} | ${guild.name}`);
                        });
                        if (guildData.moderation.warns.actions[memberData.warns.length].message) {
                            user.createMessage(ModerationHandler.replaceFlags({
                                message: guildData.moderation.warns.actions[memberData.warns.length].message,
                                client: client,
                                guild: guild,
                                user: user,
                                moderator: client.user
                            })).catch();
                        }
                    }).catch(err => {
                        return console.log(err, `^ ${guild.id} | ${guild.name}`);
                    });
                break;
            case 'kick':
                if (!guild.members.get(user.id).kickable) return;
                if (guildData.moderation.warns.actions[memberData.warns.length].message) {
                    user.createMessage(ModerationHandler.replaceFlags({
                        message: guildData.moderation.warns.actions[memberData.warns.length].message,
                        client: client,
                        guild: guild,
                        color: 0xff9933,
                        user: user,
                        moderator: client.user
                    })).catch();
                }
                await guild.members.get(user.id).kick(`Has been warned ${memberData.warns.length} times`).catch(err => {
                    return console.log(err, `^ ${guild.id} | ${guild.name}`);
                });
                ModerationHandler.registerCase(client, {
                    guild: guild,
                    user: user,
                    moderator: client.user,
                    action: 'Automatic-kick',
                    reason: `Has been warned ${memberData.warns.length} times`,
                    performedAction: `Has been kicked`
                }).catch(err => {
                    return console.log(err, `^ ${guild.id} | ${guild.name}`);
                });
                break;
            case 'ban':
                if (!guild.members.get(user.id).bannable) return;
                if (guildData.moderation.warns.actions[memberData.warns.length].message) {
                    user.createMessage(ModerationHandler.replaceFlags({
                        message: guildData.moderation.warns.actions[memberData.warns.length].message,
                        client: client,
                        guild: guild,
                        color: 0xff0000,
                        user: user,
                        moderator: client.user
                    })).catch();
                }
                await guild.members.get(user.id).ban(0, `Has been warned ${memberData.warns.length} times`).catch(err => {
                    return console.log(err, `^ ${guild.id} | ${guild.name}`);
                });
                ModerationHandler.registerCase(client, {
                    guild: guild,
                    user: user,
                    moderator: client.user,
                    action: 'Automatic-ban',
                    reason: `Has been warned ${memberData.warns.length} times`,
                    performedAction: `Has been banned`
                }).catch(err => {
                    return console.log(err, `^ ${guild.id} | ${guild.name}`);
                });
                break;
        }
    }
}