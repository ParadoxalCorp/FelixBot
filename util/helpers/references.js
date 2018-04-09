//Not sure why i would make that a class but ok

class References {
    /** 
     * This class provides all the default data model the process may use, for example, the default data models for guild and user entries in the database
     */
    constructor() {
        this.defaultPermissions = {
            allowedCommands: ["generic*"],
            restrictedCommands: ["settings*"]
        };
        this.permissionsSet = {
            allowedCommands: [],
            restrictedCommands: []
        };
    }

    /**
     * Returns the default guild entry structure used in the database
     * @param {string} id The ID of the guild
     * @returns {object} A guild entry 
     * @static
     */
    guildEntry(id) {
        return {
            id: id,
            prefix: "",
            permissions: {
                users: [],
                roles: [],
                channels: [],
                global: this.permissionsSet
            }
        };
    }

    /**
     * Returns the default user entry structure used in the database
     * @param {string} id The ID of the user
     * @returns {object} A user entry 
     * @static
     */
    userEntry(id) {
        return {
            id: id,
            blacklisted: false,
            economy: {
                coins: 500
            },
            cooldowns: {
                dailyCooldown: 0
            }
        };
    }

}

module.exports = new References();