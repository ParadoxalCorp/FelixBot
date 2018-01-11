class PayloadValidator {
    constructor(client) {
        this.client = client;
    }

    /**
     * Check if every property of the given guild object is of the same type than the default guild object
     * @param {Object} guild 
     */
    validateGuild(guild) {
        let defaultGuildData = this.client.defaultGuildData("1");
        let guildKeys = Object.keys(guild),
            defaultKeys = Object.keys(defaultGuildData);
        let invalidKeys = [];
        let multiTypes = {
            error: ['boolean', 'string'],
            message: ['boolean', 'string'],
            channel: ['boolean', 'string'],
            method: ['boolean', 'string'],
            levelUpNotif: ['boolean', 'string'],
            customNotif: ['boolean', 'string']
        };
        guildKeys.forEach(key => {
            if (typeof defaultGuildData[key] === "undefined") return delete guild[key];
            if ((typeof guild[key] !== typeof defaultGuildData[key]) && (multiTypes[key] ? !multiTypes[key].includes(typeof guild[key]) : true)) return invalidKeys.push(`Guild.${key} must be the following type: ${typeof defaultGuildData[key]}`);
            if (typeof guild[key] === "object") {
                let guildPropertyObject = Object.keys(guild[key]),
                    defaultPropertyObject = Object.keys(defaultGuildData[key]);
                guildPropertyObject.forEach(childKey => { //If property is object, which is pretty likely, check as well
                    if (typeof defaultGuildData[key][childKey] === "undefined") return;
                    if ((typeof guild[key][childKey] !== typeof defaultGuildData[key][childKey]) && (multiTypes[childKey] ? !multiTypes[childKey].includes(typeof guild[key][childKey]) : true)) return invalidKeys.push(`Guild.${key}.${childKey} must be the following type: ${typeof defaultGuildData[key][childKey]}`);
                    if (typeof guild[key][childKey] === "object") {
                        let deeperGuildObject = Object.keys(guild[key][childKey]),
                            deeperDefaultGuildObject = Object.keys(guild[key][childKey]);
                        guildPropertyObject.forEach(deeperChildKey => {
                            if (typeof defaultGuildData[key][childKey][deeperChildKey] === "undefined") return;
                            if ((typeof guild[key][childKey][deeperChildKey] !== typeof defaultGuildData[key][childKey][deeperChildKey]) && (multiTypes[deeperChildKey] ? !multiTypes[deeperChildKey].includes(typeof guild[key][childKey][deeperChildKey]) : true)) return invalidKeys.push(`Guild.${key}.${childKey}.${deeperChildKey} must be the following type: ${typeof defaultGuildData[key][childKey][deeperChildKey]}`);
                        });
                    }
                });
            }
        });
        return {
            valid: invalidKeys.length < 1 ? true : false,
            invalidKeys: invalidKeys.length < 1 ? null : invalidKeys
        }
    }

    /**
     * Check if every property of the given user object is of the same type than the default user object
     * @param {Object} user 
     */
    validateUser(user) {
        let defaultUserData = this.client.defaultUserData("1");
        let userKeys = Object.keys(user),
            defaultKeys = Object.keys(defaultUserData);
        let invalidKeys = [];
        let multiTypes = {
            afk: ['boolean', 'string']
        };
        userKeys.forEach(key => {
            if (typeof defaultUserData[key] === "undefined") return delete user[key];
            if ((typeof user[key] !== typeof defaultUserData[key]) && (multiTypes[key] ? multiTypes[key].includes(typeof user[key]) : true)) return invalidKeys.push(`User.${key} must be the following type: ${typeof defaultUserData[key]}`);
            if (typeof user[key] === "object") {
                let userPropertyObject = Object.keys(user[key]),
                    defaultPropertyObject = Object.keys(defaultUserData[key]);
                userPropertyObject.forEach(childKey => { //If property is object, which is pretty likely, check as well
                    if (typeof defaultUserData[key][childKey] === "undefined") return;
                    if ((typeof user[key][childKey] !== typeof defaultUserData[key][childKey]) && (multiTypes[childKey] ? multiTypes[childKey].includes(typeof user[key][childKey]) : true)) return invalidKeys.push(`User.${key}.${childKey} must be the following type: ${typeof defaultUserData[key][childKey]}`);
                    if (typeof user[key][childKey] === "object") {
                        let deeperUserObject = Object.keys(user[key][childKey]),
                            deeperDefaultUserObject = Object.keys(user[key][childKey]);
                        userPropertyObject.forEach(deeperChildKey => {
                            if (typeof defaultUserData[key][childKey][deeperChildKey] === "undefined") return;
                            if ((typeof user[key][childKey][deeperChildKey] !== typeof defaultUserData[key][childKey][deeperChildKey]) && (multiTypes[deeperChildKey] ? multiTypes[deeperChildKey].includes(typeof user[key][childKey][deeperChildKey]) : true)) return invalidKeys.push(`User.${key}.${childKey}.${deeperChildKey} must be the following type: ${typeof defaultUserData[key][childKey][deeperChildKey]}`);
                        });
                    }
                });
            }
        });
        return {
            valid: invalidKeys.length < 1 ? true : false,
            invalidKeys: invalidKeys.length < 1 ? null : invalidKeys
        }
    }
}

module.exports = PayloadValidator;