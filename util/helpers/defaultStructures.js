class DefaultStructures {
    constructor() {}

    /**
     * The default user object in the moderation object of the guild
     * Guild.moderation.users[0]
     * @param {String} id The id of the user
     * @returns {Object}
     */
    modUsersData(id) {
        return {
            id: id,
            warns: []
        }
    }

    /**
     * The default data object of a user warn
     * Guild.moderation.users[0].warns[0]
     * @param {String} reason The reason of the warn
     * @param {Object} moderator The moderator who warned the user
     * @param {String} [screenshot] A link to a screenshot  
     * @param {Number} [timestamp=Date.now()] UNIX timestamp in ms of when the warn happened, default is now
     * @returns {Object}
     */
    warnData(reason, moderator, screenshot, timestamp = Date.now()) {
        return {
            reason: reason,
            moderator: {
                id: moderator.id,
                tag: moderator.tag,
                username: moderator.username,
                discriminator: moderator.discriminator
            },
            screenshot: screenshot,
            timestamp: timestamp
        }
    }

    /**
     * Returns the corresponding code of a moderation case type ('warn', 'kick'...)
     * @param {String} modCaseType Type from which the corresponding code should be returned
     * @param {Object} client The client instance
     * @returns {Number}
     */
    modCaseTypeCode(modCaseType) {
        modCaseType = modCaseType.toLowerCase();
        let modCaseTypes = {
            'warn': 2999,
            'automatic-warn': 3000,
            'revoke': 3001,
            'mute': 3002,
            'global mute': 3003,
            'automatic-mute': 3004,
            'unmute': 3006,
            'global unmute': 3008,
            'kick': 3009,
            'automatic-kick': 3010,
            'ban': 3011,
            'automatic-ban': 3012,
            'soft-ban': 3013,
            'unban': 3014,
            'automatic-soft-ban': 3015
        };
        //Return code and handle custom mutes
        return modCaseType.includes('mute') && !modCaseTypes[modCaseType] ? 3005 : (modCaseType.includes('unmute') && !modCaseTypes[modCaseType] ? 3007 : modCaseTypes[modCaseType]);
    }

    /**
     * The custom muted roles structure
     * Guild.moderation.mutedRoles[0]
     * @param {String} id ID of the role
     * @param {String} name Name of the role, can also be anything that resolve to false
     */
    customMutedRole(id, name) {
        return {
            id: id,
            name: name
        }
    }

    /**
     * The warn action structure
     * Guild.moderation.warns.actions[0]
     * @param {String} action The action to take at this warn count
     * @param {String || Boolean} message An optional custom message to send to the user, has a notif or smth
     * @param {String || Boolean} customMutedRole Specific to mutes, the ID of the custom muted role to use
     */
    warnAction(action, message, customMutedRole) {
        return {
            action: action,
            message: message,
            customMutedRole: customMutedRole
        }
    }
}

module.exports = new DefaultStructures;