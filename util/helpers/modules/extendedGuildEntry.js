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
     * Return this without the additional methods, essentially returns a proper database entry, ready to be saved into the database
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