const DefaultStructures = require('./defaultStructures');

class ModerationHandler {
    constructor() {}

    /**
     * @param {Object} params An object of parameters
     * @prop {Object} params.client The client
     * @prop {Object} params.guild The guild in which the case occurred
     * @prop {Object} params.user The user concerned by the case
     * @prop {Object} params.moderator The responsible moderator of the case 
     * @prop {String} params.message The message to replace the flags from
     * @returns {String} params.message with all the flags replaced
     */
    replaceFlags(params) {
        const guildData = params.client.guildData.get(params.guild.id);
        return params.message.replace(/%WARNCOUNT%/gim, guildData.moderation.users.find(u => u.id === params.user.id).warns.length)
            .replace(/%GUILD%/gim, params.guild.name);
    }

    /**
     * @param {Object} params An object of parameters
     * @prop {Object} params.client The client instance
     * @prop {Object} params.guild The guild in which the user has been warned
     * @prop {Object} params.user The user that has been warned
     * @prop {String} params.reason The reason of the warn
     * @prop {Object} moderator The moderator responsible of the warn
     * @prop {String} [params.screenshot] Link to a screenshot
     * @prop {Number} [params.timestamp=Date.now()] UNIX timestamp in ms of when the case happened, default is now
     * @returns {Object} The warn object
     */
    addWarn(params) {
        const guildData = params.client.guildData.get(params.guild.id);
        const memberPos = guildData.moderation.users.findIndex(u => u.id === params.user.id) >= 0 ? guildData.moderation.users.findIndex(u => u.id === params.user.id) :
            guildData.moderation.users.push(DefaultStructures.modUsersData(params.user.id)) - 1;
        guildData.moderation.users[memberPos].warns.push(DefaultStructures.warnData(params.reason, params.moderator, params.screenshot, params.timestamp));
        params.client.guildData.set(guildData.id, guildData);
        return params.client.guildData.get(params.guild.id).moderation.users[memberPos].warns[guildData.moderation.users[memberPos].warns.length - 1];
    }

    /**
     * Register a new moderation case
     * @param {Object} client The client
     * @param {Object} case An object of information about this case
     * @prop {Guild} case.guild The guild in which a moderation action has been taken
     * @prop {User} case.user The user on which an action has been performed
     * @prop {User} case.moderator The moderator who performed the action
     * @prop {String} case.action The action performed, e.g "kick", "ban"...
     * @prop {String} case.reason The reason of the action
     * @prop {Integer} case.color The color in 0x format, in case its a custom action
     * @prop {String} [case.screenshot] The url of a screenshot that could be added as thumbnail to the case
     * @prop {String} [case.performedAction] The performed action (Replace "Has been..."), this should be specified for every case that hasn't a preset-action (actions that are achieved with commands, like kicks)
     * @prop {Number} [case.type] The type code, it shouldn't be specified unless the action isn't stable
     * @returns {Promise<Boolean>}
     */

    registerCase(client, newCase) {
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
                    },
                    warn: {
                        color: 0xffcc00,
                        action: "warned"
                    },
                    revoke: {
                        color: 0x00ff00,
                        action: 'forgiven'
                    }
                }
                let modCase = cases[newCase.action];
                guildEntry.modLog.cases.push({
                    user: {
                        id: newCase.user ? newCase.user.id : newCase.id,
                        username: newCase.user ? newCase.user.username : newCase.username,
                        tag: newCase.user ? newCase.user.tag || `${newCase.user.username}#${newCase.user.discriminator}` : newCase.tag || `${newCase.username}#${newCase.discriminator}`,
                        discriminator: newCase.user ? newCase.user.discriminator : newCase.discriminator
                    },
                    color: newCase.color || (modCase ? modCase.color : 0x4f545c),
                    action: newCase.action,
                    type: newCase.type || DefaultStructures.modCaseTypeCode(newCase.action),
                    performedAction: newCase.performedAction || modCase.action,
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
                if (guildEntry.modLog.channel) {
                    let logMessage = await client.createMessage(guildEntry.modLog.channel, {
                        embed: {
                            title: `Case #${guildEntry.modLog.cases.length}`,
                            color: newCase.color || (modCase ? modCase.color : 0x4f545c),
                            fields: [{
                                name: "User",
                                value: `${newCase.user.tag} (${newCase.user.id})`,
                                inline: true
                            }, {
                                name: "Moderator",
                                value: newCase.moderator ? `${newCase.moderator.tag} (<@${newCase.moderator.id}>)` : `Unknown, responsible moderator, please use \`${guildEntry.generalSettings.prefix}assign ${guildEntry.modLog.cases.length}\``,
                                inline: true
                            }, {
                                name: "Action",
                                value: newCase.performedAction ? newCase.performedAction : `Has been ${modCase.action}`
                            }, {
                                name: "Reason",
                                value: newCase.reason ? newCase.reason : `None specified, responsible moderator, please use \`${guildEntry.generalSettings.prefix}reason ${guildEntry.modLog.cases.length} <reason>\` to add a reason`,
                            }],
                            timestamp: new Date(Date.now()).toISOString(),
                            image: newCase.screenshot ? {
                                url: newCase.screenshot
                            } : undefined
                        }
                    }).catch((err) => console.log(err, `^ ${newCase.guild.id} | ${newCase.guild.name}`));
                    guildEntry.modLog.cases[guildEntry.modLog.cases.length - 1].modLogMessage = logMessage ? logMessage.id : undefined;
                }
                client.guildData.set(newCase.guild.id, guildEntry);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new ModerationHandler();