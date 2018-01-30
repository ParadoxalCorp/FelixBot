const ModerationHandler = require('./moderationHandler');

class InviteHandler {
    constructor() {};

    handle(client, message) {
        return new Promise(async(resolve, reject) => {
            const guildData = client.guildData.get(message.guild.id);
            if (!guildData.moderation.inviteFiltering.enabled) return resolve();
            let invitesCode = this._inviteParser(message.content);
            if (!invitesCode[0]) return resolve();
            if (!message.guild.members.get(client.user.id).hasPermission("manageMessages")) return resolve();
            if (invitesCode.length > 3) {
                return resolve(message.delete());
            }
            //Synchronously check the invites to win time 
            //But abort all others checks if one matched already
            let matchedInvite = false;
            invitesCode.forEach(code => {
                client.getInvite(code).then(async(invite) => {
                    if (matchedInvite) return;
                    if (!guildData.moderation.inviteFiltering.whitelistedGuilds.includes(invite.guild.id) && invite.guild.id !== message.guild.id && invite.guild.id !== "328842643746324481") {
                        matchedInvite = true;
                        await message.delete().catch(err => console.error(err));
                        //Take further moderation actions
                        if (guildData.moderation.inviteFiltering.warn) {
                            ModerationHandler.registerCase(client, {
                                guild: message.guild,
                                user: message.author,
                                moderator: client.user,
                                action: 'warn',
                                performedAction: 'Has been automatically warned',
                                reason: 'Advertized one or multiple other servers'
                            }).catch(err => {
                                return client.emit('error', err, message);
                            }).then(() => {
                                ModerationHandler.addWarn({ client: client, guild: message.guild, user: message.author, reason: 'Advertized one or multiple other servers', moderator: client.user });
                                if (guildData.moderation.inviteFiltering.warnMessage) {
                                    message.author.createMessage(ModerationHandler.replaceFlags({
                                        message: guildData.moderation.inviteFiltering.warnMessage,
                                        client: client,
                                        guild: message.guild,
                                        user: message.author,
                                        moderator: client.user
                                    })).catch();
                                }
                                //The warnsUpdate event listener will handle stuff such as taking actions at a specific warn count
                                client.emit('warnsUpdate', message.guild, message.author);
                            });
                        }
                    }
                }).catch(err => {
                    if (matchedInvite) return;
                    matchedInvite = true;
                    message.delete().catch();
                    //Since the invite is invalid, do not take anymore moderation action (could be just to meme idk)
                })
            })
        })
    }

    _inviteParser(message) {
        let invitePattern = new RegExp(/https\:\/\/discord\.gg\/[A-Za-z0-9]+|discord\.gg\/[A-Za-z0-9]+/gim);
        let invites = [];
        let matchedAll = false;
        while (!matchedAll) {
            let match = invitePattern.exec(message);
            if (match) {
                invites = invites.concat(match);
                message.replace(match[0], '');
            } else {
                matchedAll = true;
            }
        }
        return invites.map(i => i.substr(i.toLowerCase().indexOf('gg/') + 3));
    }
}

module.exports = new InviteHandler();