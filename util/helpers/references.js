//Not sure why i would make that a class but ok

/** 
 * This class provides all the default data model the process may use, for example, the default data models for guild and user entries in the database
 * @prop {object} defaultPermissions The default permissions object
 * @prop {object} permissionsSet The default permissions object, but with empty arrays
 */
class References {
    constructor() {
        this.defaultPermissions = {
            allowedCommands: ["generic*", "fun*"],
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
            cooldowns: {
                dailyCooldown: 0
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
        }
    }

}

module.exports = new References();