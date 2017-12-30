/**
 * Register a new moderation case
 * @param {Object} client The client
 * @param {Object} case An object of information about this case
 * @param {Guild} case.guild The guild in which a moderation action has been taken
 * @param {User} case.user The user on which an action has been performed
 * @param {User} case.moderator The moderator who performed the action
 * @param {String} case.action The action performed, e.g "kick", "ban"...
 * @param {String} case.reason The reason of the action
 * @param {String} [case.screenshot] The url of a screenshot that could be added as thumbnail to the case
 * @param {String} [case.performedAction] The performed action, basically a custom action
 */

function registerCase(client, newCase) {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(newCase.guild.id) || client.defaultGuildData.get(newCase.guild.id);
            let cases = {
                ban: {
                    color: 0xff0000,
                    action: "banned"
                },
                kick: {
                    color: 0xff9933,
                    action: "kicked"
                },
                mute: {
                    color: 0xffcc00,
                    action: "muted"
                },
                unban: {
                    color: 0x00ff00,
                    action: "unbanned"
                },
                unmute: {
                    color: 0x00ff00,
                    action: "unmuted"
                },
                hackban: {
                    color: 0xff0000,
                    action: 'hack-banned'
                }
            }
            let modCase = cases[newCase.action];
            guildEntry.generalSettings.modLog.push({
                user: {
                    id: newCase.user ? newCase.user.id : newCase.id,
                    username: newCase.user ? newCase.user.username : newCase.username,
                    tag: newCase.user ? newCase.user.tag || `${newCase.user.username}#${newCase.user.discriminator}` : newCase.tag || `${newCase.username}#${newCase.discriminator}`,
                    discriminator: newCase.user ? newCase.user.discriminator : newCase.discriminator
                },
                color: modCase.color,
                action: newCase.action,
                performedAction: modCase.action,
                customPerformedAction: newCase.performedAction,
                screenshot: newCase.screenshot,
                moderator: newCase.moderator ? {
                    id: newCase.moderator.id,
                    username: newCase.moderator.username,
                    tag: newCase.moderator.tag,
                    discriminator: newCase.moderator.discriminator
                } : false,
                reason: newCase.reason,
                timestamp: Date.now()
            });
            try {
                if (guildEntry.generalSettings.modLogChannel) {
                    let logMessage = await client.createMessage(guildEntry.generalSettings.modLogChannel, {
                        embed: {
                            title: `Case #${guildEntry.generalSettings.modLog.length}`,
                            color: modCase.color,
                            fields: [{
                                name: "User",
                                value: `${newCase.user.tag} (${newCase.user.id})`,
                                inline: true
                            }, {
                                name: "Moderator",
                                value: newCase.moderator ? `${newCase.moderator.tag} (<@${newCase.moderator.id}>)` : `Unknown, responsible moderator, please use \`${guildEntry.generalSettings.prefix}assign ${guildEntry.generalSettings.modLog.length}\``,
                                inline: true
                            }, {
                                name: "Action",
                                value: newCase.performedAction ? newCase.performedAction : `Has been ${modCase.action}`
                            }, {
                                name: "Reason",
                                value: newCase.reason ? newCase.reason : `None specified, responsible moderator, please use \`${guildEntry.generalSettings.prefix}reason ${guildEntry.generalSettings.modLog.length} <reason>\` to add a reason`,
                            }],
                            timestamp: new Date(Date.now()).toISOString(),
                            image: newCase.screenshot ? {
                                url: newCase.screenshot
                            } : undefined
                        }
                    });
                    guildEntry.generalSettings.modLog[guildEntry.generalSettings.modLog.length - 1].modLogMessage = logMessage.id;
                }
            } catch (err) {
                console.error(err);
            } finally {
                client.guildData.set(newCase.guild.id, guildEntry);
                resolve(true);
            }
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = registerCase;