//Not sure why i would made that a class but ok

class References {
    /** 
     * This class provides all the default data model the process may use, for example, the default data models for guild and user entries in the database
     * This class contains only static methods and may not be instantiated
     */
    constructor() {}

    /**
     * Returns the default guild entry structure used in the database
     * @param {string} id The ID of the guild
     * @returns {object} A guild entry 
     * @static
     */
    static guildEntry(id) {
        return {
            id: id,
            prefix: ""
        };
    }

    /**
     * Returns the default user entry structure used in the database
     * @param {string} id The ID of the user
     * @returns {object} A user entry 
     * @static
     */
    static userEntry(id) {
        return {
            id: id,
            blacklisted: false
        };
    }
}

module.exports = References;