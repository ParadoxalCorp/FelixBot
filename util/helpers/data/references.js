//Not sure why i would make that a class but ok

/** 
 * This class provides all the default data model the process may use, for example, the default data models for guild and user entries in the database
 * @prop {object} defaultPermissions The default permissions object
 * @prop {object} permissionsSet The default permissions object, but with empty arrays
 */
class References {
    constructor() {
        this.defaultPermissions = {
            allowedCommands: ["generic*", "fun*", 'economy*', 'misc*', 'utility*', 'image*'],
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
     */
    guildEntry(id) {
        return {
            id: id,
            prefix: "",
            spacedPrefix: true,
            selfAssignableRoles: [],
            permissions: {
                users: [],
                roles: [],
                channels: [],
                global: this.permissionsSet
            },
            experience: {
                members: [],
                roles: [],
                enabled: false,
                notifications: {
                    channel: '',
                    message: '',
                    enabled: true
                }
            }
        };
    }

    /**
     * Entry for guildEntry.experience.members
     * Store experience-system related data
     * @param {string} id - The ID of the member
     * @returns {object} The object
     */
    guildMember(id) {
        return {
            id: id,
            experience: 0
        };
    }

    /**
     * 
     * @param {string} id - The ID of the role
     * @param {number} at - The level at which this role should be given
     * @param {boolean} isStatic - Whether this role should be removed when a higher one is won, if false, the role will be removed
     * @return {object} The role object
     */
    activityGuildRole(id, at, isStatic = true) {
        return {
            id: id,
            static: isStatic,
            at: at
        };
    }

    /**
     * Returns the default user entry structure used in the database
     * @param {string} id The ID of the user
     * @returns {object} A user entry 
     */
    userEntry(id) {
        return {
            id: id,
            blacklisted: false,
            economy: {
                coins: 500,
                transactions: [],
                items: []
            },
            love: {
                amount: 0
            },
            experience: {
                amount: 0
            },
            cooldowns: {
                dailyCooldown: 0,
                loveCooldown: {
                    max: 2,
                    cooldowns: []
                }
            }
        };
    }

    /**
     * 
     * @param {object} data An object of data
     * @param {number} data.amount The amount of coins that has been debited/credited(negative if debited, positive if credited)
     * @param {string} data.from  Username#Discriminator of the user from who the coins once belonged
     * @param {string} data.to Username#Discriminator of who received the coins
     * @param {string} data.reason The reason of the transfer (automatic, intended..)
     * @return {object} The transaction data object
     */
    transactionData(data) {
        return {
            amount: data.amount,
            from: data.from,
            to: data.to,
            reason: data.reason,
            date: Date.now()
        };
    }

    /**
     * 
     * @param {object} item - The item
     * @returns {{id: number, count: number}} The item database entry
     */
    item(item) {
        return {
            id: item.id,
            count: 1
        };
    }

}

module.exports = new References();