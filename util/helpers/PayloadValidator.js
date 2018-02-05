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
            customNotif: ['boolean', 'string'],
            leftAt: ['boolean', 'number']
        };
        if (guildKeys.filter(k => defaultKeys.includes(k)).length < defaultKeys.length) {
            return { valid: false, invalidKeys: defaultKeys.filter(k => !guildKeys.includes(k)).map(k => `Missing ${k} property`) };
        }
        guildKeys.forEach(key => {
            if (typeof defaultGuildData[key] === "undefined") return delete guild[key];
            if ((typeof guild[key] !== typeof defaultGuildData[key]) && (multiTypes[key] ? !multiTypes[key].includes(typeof guild[key]) : true)) return invalidKeys.push(`Guild.${key} must be the following type: ${typeof defaultGuildData[key]}`);
            if (typeof guild[key] === "object" && !Array.isArray(guild[key])) { //If property is object, which is pretty likely, check as well
                let guildPropertyObject = Object.keys(guild[key]),
                    defaultPropertyObject = Object.keys(defaultGuildData[key]);
                if (guildPropertyObject.filter(k => defaultPropertyObject.includes(k)).length < defaultPropertyObject.length) {
                    return invalidKeys = invalidKeys.concat(defaultPropertyObject.filter(k => !guildPropertyObject.includes(k)).map(k => `Missing ${key}.${k} property`));
                }
                guildPropertyObject.forEach(childKey => {
                    if (typeof defaultGuildData[key][childKey] === "undefined") return delete guild[key][childKey];
                    if ((typeof guild[key][childKey] !== typeof defaultGuildData[key][childKey]) && (multiTypes[childKey] ? !multiTypes[childKey].includes(typeof guild[key][childKey]) : true)) return invalidKeys.push(`Guild.${key}.${childKey} must be the following type: ${typeof defaultGuildData[key][childKey]}`);
                    if (typeof guild[key][childKey] === "object" && !Array.isArray(guild[key][childKey])) {
                        let deeperGuildObject = Object.keys(guild[key][childKey]),
                            deeperDefaultGuildObject = Object.keys(guild[key][childKey]);
                        if (deeperGuildObject.filter(k => deeperDefaultGuildObject.includes(k)).length < deeperDefaultGuildObject.length) {
                            return invalidKeys = invalidKeys.concat(deeperDefaultGuildObject.filter(k => !deeperGuildObject.includes(k)).map(k => `Missing ${key}.${childKey}.${k} property`));
                        }
                        deeperGuildObject.forEach(deeperChildKey => {
                            if (typeof defaultGuildData[key][childKey][deeperChildKey] === "undefined") return delete guild[key][childKey][deeperChildKey];
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
        if (userKeys.filter(k => defaultKeys.includes(k)).length < defaultKeys.length) {
            return { valid: false, invalidKeys: defaultKeys.filter(k => !userKeys.includes(k)).map(k => `Missing ${k} property`) };
        }
        userKeys.forEach(key => {
            if (typeof defaultUserData[key] === "undefined") return delete user[key];
            if ((typeof user[key] !== typeof defaultUserData[key]) && (multiTypes[key] ? multiTypes[key].includes(typeof user[key]) : true)) return invalidKeys.push(`User.${key} must be the following type: ${typeof defaultUserData[key]}`);
            if (typeof user[key] === "object" && !Array.isArray(user[key])) {
                let userPropertyObject = Object.keys(user[key]),
                    defaultPropertyObject = Object.keys(defaultUserData[key]);
                if (userPropertyObject.filter(k => defaultPropertyObject.includes(k)).length < defaultPropertyObject.length) {
                    return invalidKeys = invalidKeys.concat(defaultPropertyObject.filter(k => !userPropertyObject.includes(k)).map(k => `Missing ${key}.${k} property`));
                }
                userPropertyObject.forEach(childKey => { //If property is object, which is pretty likely, check as well
                    if (typeof defaultUserData[key][childKey] === "undefined") return delete defaultUserData[key][childKey];
                    if ((typeof user[key][childKey] !== typeof defaultUserData[key][childKey]) && (multiTypes[childKey] ? multiTypes[childKey].includes(typeof user[key][childKey]) : true)) return invalidKeys.push(`User.${key}.${childKey} must be the following type: ${typeof defaultUserData[key][childKey]}`);
                    if (typeof user[key][childKey] === "object" && !Array.isArray(user[key][childKey])) {
                        let deeperUserObject = Object.keys(user[key][childKey]),
                            deeperDefaultUserObject = Object.keys(user[key][childKey]);
                        if (deeperUserObject.filter(k => deeperDefaultUserObject.includes(k)).length < deeperDefaultUserObject.length) {
                            return invalidKeys = invalidKeys.concat(deeperDefaultUserObject.filter(k => !deeperUserObject.includes(k)).map(k => `Missing ${key}.${childKey}.${k} property`));
                        }
                        deeperUserObject.forEach(deeperChildKey => {
                            if (typeof defaultUserData[key][childKey][deeperChildKey] === "undefined") return delete defaultUserData[key][childKey][deeperChildKey];
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