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
     * @returns {Number}
     */
    modCaseTypeCode(modCaseType) {
        let modCaseTypes = {
            'warn': 2999,
            'forgive': 3000,
            'mute': 3001,
            'Global mute': 3002,
            'unmute': 3004,
            'Global unmute': 3005,
            'kick': 3007,
            'ban': 3008,
            'unban': 3009,
        };
        //Return code and handle custom mutes
        return modCaseType.includes('mute') && !modCaseTypes[modCaseType] ? 3003 : (modCaseType.includes('unmute') && !modCaseTypes[modCaseType] ? 3006 : modCaseTypes[modCaseType]);
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
}

module.exports = new DefaultStructures;