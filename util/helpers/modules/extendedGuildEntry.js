'use strict';

class ExtendedGuildEntry {
    /**
     * 
     * @param {*} guildEntry - The guild entry
     * @param {*} client - The client instance
     */
    constructor(guildEntry, client) {
        Object.assign(this, guildEntry);
        this.client = client;
    }

    get getPrefix() {
        return this.prefix || this.client.config.prefix;
    }

    /**
     * Check if the specified member has the permission to run the given command
     * @param {string} memberID - The member ID to check if they have the permission to run the specified command
     * @param {*} command - The command
     * @param {*} channel - The channel in which the command is attempted to be used
     * @returns {boolean} Whether or not the specified member is allowed to use the given command
     */
    memberHasPermission(memberID, command, channel) {
        let allowed;
        const member = this.client.bot.guilds.get(this.id).members.get(memberID);
        //Filter the user roles that aren't in the database, sort them by position and finally map them to iterate through them later
        const rolesInDB = member.roles.filter(role => this.permissions.roles.find(r => r.id === role)).sort((a, b) => member.guild.roles.get(a).position -
            member.guild.roles.get(b).position).map(r => { return { name: "roles", id: r }; });
        [{ name: this.client.refs.defaultPermissions }, { name: "global" }, { name: "channels", id: channel.id }, ...rolesInDB, { name: "users", id: member.id }].forEach(val => {
            if (this.getPrioritaryPermission(val.name, command, val.id) !== undefined) {
                allowed = this.getPrioritaryPermission(val.name, command, val.id);
            }
        });
        if (member.permission.has("administrator")) {
            allowed = true;
        }
        if (command.help.category === "admin") {
            if (this.client.config.admins.includes(member.id)) {
                allowed = command.conf.ownerOnly && this.client.config.ownerID !== member.id ? false : true;
            } else {
                allowed = false;
            }
        }

        return allowed;
    }

    /**
     * Get the prioritary permission of a target and check if they are allowed to use the given command
     * @param {string} target - The name of the permissions to check ("channels", "roles", "users"..) OR an array/object following the exact same structure than the rest
     * @param {*} command - The command
     * @param {string} [targetID] - Optional, the ID of the target to get the prioritary permission for
     * @returns {boolean} Whether or not the target is allowed to use the command
     */
    getPrioritaryPermission(target, command, targetID) {
        let targetPos;
        if (typeof target !== 'string') {
            if (Array.isArray(target)) {
                targetPos = target.find(t => t.id === targetID);
            } else {
                targetPos = target;
            }
        } else {
            if (Array.isArray(this.permissions[target])) {
                targetPos = this.permissions[target].find(t => t.id === targetID);
            } else {
                targetPos = this.permissions[target];
            }
        }
        let isAllowed;
        if (!targetPos) {
            return undefined;
        }
        //Give priority to commands over categories by checking them after the categories
        if (targetPos.allowedCommands.includes(`${command.help.category}*`)) {
            isAllowed = true;
        }
        if (targetPos.restrictedCommands.includes(`${command.help.category}*`)) {
            isAllowed = false;
        }
        if (targetPos.allowedCommands.includes(command.help.name)) {
            isAllowed = true;
        }
        if (targetPos.restrictedCommands.includes(command.help.name)) {
            isAllowed = false;
        }
        return isAllowed;
    }

    /**
     * Get the activity level of a member
     * @param {string} id The ID of the member to get the level from
     * @returns {number} The level
     * @example Guild.getLevelOf("123456789");
     */
    getLevelOf(id) {
        const member = this.experience.members.find(m => m.id === id) || this.client.refs.guildMember(id);
        return Math.floor(Math.pow(member.experience / this.client.config.options.experience.baseXP, 1 / this.client.config.options.experience.exponent));
    }

    /**
     * Get the activity-related member object of a member of the guild
     * @param {string} id - The ID of the member
     * @returns {object} The member object
     * @example Guild.getMember("123456789");
     */
    getMember(id) {
        return this.experience.members.find(m => m.id === id) || this.client.refs.guildMember(id);
    }

    /**
     * 
     * 
     * @param {number} amount - The amount of experience to add 
     * @returns {{to: function}} An object, with a .to(id) callback function to call with the ID of the member to add the experience to. 
     * @example Guild.addExperience(15).to("123456798");
     */
    addExperience(amount) {
        return {
            to: (id) => {
                let member = this.experience.members[this.experience.members.findIndex(m => m.id === id)];
                if (!member) {
                    this.experience.members.push(this.client.refs.guildMember(id));
                    member = this.experience.members[this.experience.members.findIndex(m => m.id === id)];
                }
                member.experience = member.experience + amount;
                return member.experience;
            }
        };
    }

    /**
     * Remove a role set to be given at a certain level
     * @param {string} id - The ID of the role to remove
     * @returns {number} The new count of roles set to be given at a certain level
     * @example Guild.removeActivityRole("123456789");
     */
    removeActivityRole(id) {
        this.experience.roles.splice(this.experience.roles.findIndex(r => r.id === id), 1);
        return this.experience.roles.length;
    }

    /**
     * Check if the guild has the premium status
     * @returns {boolean} Whether the guild has the premium status or not 
     */
    hasPremiumStatus() {
        if (typeof this.premium === 'number') {
            return this.premium > Date.now();
        } else {
            return this.premium ? true : false;
        }
        
    }

    /**
     * Return this without the additional methods, essentially returns a proper database entry, ready to be saved into the database
     * Note that this shouldn't be called before saving it into the database, as the database wrapper already does it
     * @returns {*} - This, as a proper database entry object (without the additional methods)
     */
    toDatabaseEntry() {
        const cleanObject = (() => {
            const newObject = {};
            for (const key in this) {
                if (typeof this[key] !== 'function' && key !== 'client') {
                    newObject[key] = this[key];
                }
            }
            return newObject;
        })();
        return cleanObject;
    }
}

module.exports = ExtendedGuildEntry;