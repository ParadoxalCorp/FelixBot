'use strict';

const log = require('../modules/log');
const references = require('./references');

class DatabaseWrapper {
    /**
     * Wraps the most important methods of RethinkDB and does smart things in the background
     * @param {object} client - The client (or bot) instance
     * @param {function} updateFunc - Optional, the function that should be called to update the retrieved entries from the database before returning them. This update function will be called instead of the default update strategy, with the "data" and "type" arguments, which are respectively the database entry and the type of the database entry (either "guild" or "user"). The update function must return an object, this is the object that the DatabaseWrapper.getGuild() and DatabaseWrapper.getUser() methods will return.
     * @example 
     * //Context: In this example, the old user data model used to have its "boolean" property containing either 1 or 0, and we want to update it to either true or false
     * new DatabaseWrapper(client, (data, type) => {
     *   if (type === "guild") {
     *     return data; 
     *   } else {
     *     data.boolean = data.boolean === 1 ? true : false;
     *     return data;   
     *   }
     * });
     */
    constructor(client, updateFunc) {
        this.rethink = require("rethinkdbdash")({
            servers: [
                { host: client.config.database.host, port: client.config.database.port }
            ],
            silent: true,
            log: (message) => {
                log.info(message);
            }
        });
        this.updateFunc = updateFunc;
        this.guildData = this.rethink.db('data').table('guilds');
        this.userData = this.rethink.db('data').table('users');
        this.client = client;
        this.users = new(require('./Collection'))();
        this.guilds = new(require('./Collection'))();
    }

    /** 
     * Initialize the database wrapper, this will start the automatic progressive caching of the database and dynamically handle disconnections
     * @returns {Promise<void>} - An error will be rejected if something fail when establishing the changes stream
     */
    init() {
        return new Promise(async(resolve, reject) => {
            const guildCursor = await this.guildData.changes({ squash: true, includeInitial: true, includeTypes: true }).run().catch(err => reject(err));
            const userCursor = await this.userData.changes({ squash: true, includeInitial: true, includeTypes: true }).run().catch(err => reject(err));

            guildCursor.on('data', (data) => {
                if (data.type === "remove") {
                    this.guilds.delete(data.old_val.id);
                } else {
                    this.guilds.set(data.new_val.id, data.new_val);
                }
            });

            userCursor.on('data', (data) => {
                if (data.type === "remove") {
                    this.users.delete(data.old_val.id);
                } else {
                    this.users.set(data.new_val.id, data.new_val);
                }
            });

            this.rethink.getPoolMaster().on('healthy', healthy => {
                if (!healthy) {
                    log.warn('The connection with the database has been closed, commands using the database will be disabled until a successful re-connection has been made');
                    this.client.commands
                        .filter(c => c.conf.requireDB)
                        .forEach(c => c.conf.disabled = ":x: This command uses the database, however the database seems unavailable at the moment");
                } else {
                    log.info(`The connection with the database at ${this.client.config.database.host}:${this.client.config.database.port} has been established`);
                    this.client.commands
                        .filter(c => c.conf.requireDB)
                        .forEach(c => c.conf.disabled = false);
                }
            });
        });
    }

    /**
     * Get a guild database entry
     * @param {string} id - The unique identifier of the guild to get
     * @returns {Promise<object>} - The guild entry object, or null if not in the database
     */
    getGuild(id) {
        return new Promise(async(resolve, reject) => {
            if (this.guilds.has(id)) {
                return resolve(this._updateDataModel(this.guilds.get(id), 'guild'));
            }
            this.guildData.get(id).run()
                .then(data => {
                    resolve(data ? this._updateDataModel(data, 'guild') : null);
                })
                .catch(err => {
                    reject(err);
                    this.client.emit('error', err);
                });
        });
    }

    /**
     * Get a user database entry
     * @param {string} id - The unique identifier of the user to get
     * @returns {Promise<object>} - The user entry object, or null if not in the database
     */
    getUser(id) {
        return new Promise(async(resolve, reject) => {
            if (this.users.has(id)) {
                return resolve(this._updateDataModel(this.users.get(id), 'user'));
            }
            this.userData.get(id).run()
                .then(data => {
                    resolve(data ? this._updateDataModel(data, 'user') : null);
                })
                .catch(err => {
                    reject(err);
                    this.client.emit('error', err);
                });
        });
    }

    /**
     * The default update strategy, the custom update function, if any, is called from here as well
     * @param {object} data - The data object to update
     * @param {string} type - The type of this object (either "guild" or "user")
     * @returns {object} - The updated data object
     * @private
     */
    _updateDataModel(data, type) {
        if (this.updateFunc) {
            return this.updateFunc(data, type);
        }
        const defaultDataModel = type === "guild" ? references.guildEntry(data.id) : references.userEntry(data.id);
        for (const key in data) {
            if (typeof defaultDataModel[key] !== "undefined") {
                defaultDataModel[key] = data[key];
            }
        }
        return defaultDataModel;
    }

    /**
     * Insert or update a user/guild in the database
     * @param {object} data - The data object to update/insert in the database 
     * @param {string} type - Can be "guild" or "user", whether the data object to be set is a guild or a user
     * @returns {Promise<object>} - The inserted/updated object, or reject the error if any
     */
    set(data, type) {
        return new Promise(async(resolve, reject) => {
            if (!data || !type) {
                return reject(`Missing arguments, both the data and type parameters are needed`);
            }
            type = type === "guild" ? "guildData" : "userData";
            this[type].get(data.id).replace(data, { returnChanges: "always" }).run()
                .then(result => {
                    this[type === "guild" ? "guilds" : "users"].set(data.id, data);
                    resolve(result.changes[0].new_val);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * Create a new database
     * @param {string} name - The name of the database to create, if there is already a database with this name, the promise will be resolved and nothing will change
     * @returns {Promise<boolean>} - true if success, otherwise, the error is rejected
     */
    createDatabase(name) {
        return new Promise(async(resolve, reject) => {
            const databaseList = await this.rethink.dbList().run().catch(err => Promise.reject(new Error(err)));
            if (databaseList.includes(name)) {
                resolve(`There is already an existing database with the name ${name}`);
            }
            this.rethink.dbCreate(name).run()
                .then(() => {
                    resolve(true);
                })
                .catch(err => {
                    reject(new Error(err));
                });
        });
    }

    /**
     * Create a new table in the specified database
     * @param {string} name - The name of the table to create, if there is already a table with this name, the promise will be resolved and nothing will change
     * @param {string} databaseName - The name of the database to create the table in
     * @returns {Promise<boolean>} - true if success, otherwise, the error is rejected
     */
    createTable(name, databaseName) {
        return new Promise(async(resolve, reject) => {
            const tableList = await this.rethink.db(databaseName).tableList().run().catch(err => Promise.reject(new Error(err)));
            if (tableList.includes(name)) {
                resolve(`There is already a table with the name ${name} in the database ${databaseName}`);
            }
            this.rethink.db(databaseName).tableCreate(name).run()
                .then(() => {
                    resolve(true);
                })
                .catch(err => {
                    reject(new Error(err));
                });
        });
    }


}

module.exports = DatabaseWrapper;