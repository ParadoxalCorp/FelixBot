const EventEmitter = require("events").EventEmitter;
const sleep = require('../modules/sleep');

class DatabaseUpdater extends EventEmitter {
    constructor() {
        super();
    }

    updateUsers(client) {
        return new Promise(async(resolve, reject) => {
            try {
                let startTime = Date.now();
                let usersUpdated = 0;
                client.userData.forEach(user => {
                    let defaultUserData = client.defaultUserData(user.id);
                    let userKeys = Object.keys(user),
                        defaultKeys = Object.keys(defaultUserData);
                    userKeys.forEach(key => {
                        if (typeof user[key] === "object" && defaultUserData[key]) {
                            let userPropertyObject = Object.keys(user[key]),
                                defaultPropertyObject = Object.keys(defaultUserData[key]);
                            userPropertyObject.forEach(function(childKey) { //If property is object, which is pretty likely, check as well
                                if (typeof user[key][childKey] === "object" && defaultUserData[key][childKey]) {
                                    let deeperObjectKeys = Object.keys(user[key][childKey]),
                                        deeperDefaultObjectKeys = Object.keys(defaultUserData[key][childKey]);
                                    deeperObjectKeys.forEach(deeperKey => { //If property is object, which is pretty likely, check as well
                                        if (deeperDefaultObjectKeys.includes(deeperKey)) {
                                            defaultUserData[key][childKey][deeperKey] = user[key][childKey][deeperKey];
                                        }
                                    });
                                } else if (defaultPropertyObject.includes(childKey)) defaultUserData[key][childKey] = user[key][childKey];
                            });
                        } else if (defaultKeys.includes(key)) defaultUserData[key] = user[key];
                    });
                    client.userData.set(user.id, defaultUserData);
                    usersUpdated++;
                });
                let results = {
                    entriesUpdated: usersUpdated,
                    time: Date.now() - startTime
                }
                resolve(results);
                this.emit(`userDatabaseUpdated`, results);
            } catch (err) {
                reject(err);
                client.emit("error", err);
            }
        });
    }

    updateGuilds(client) {
        return new Promise(async(resolve, reject) => {
            try {
                let startTime = Date.now();
                let guildsUpdated = 0;
                client.guildData.forEach(guild => {
                    let defaultGuildData = client.defaultGuildData(guild.id);
                    let guildKeys = Object.keys(guild),
                        defaultKeys = Object.keys(defaultGuildData);
                    guildKeys.forEach(key => {
                        if (typeof guild[key] === "object" && defaultGuildData[key]) {
                            let guildPropertyObject = Object.keys(guild[key]),
                                defaultPropertyObject = Object.keys(defaultGuildData[key]);
                            guildPropertyObject.forEach(childKey => { //If property is object, which is pretty likely, check as well
                                if (typeof guild[key][childKey] === "object" && defaultGuildData[key][childKey]) {
                                    let deeperObjectKeys = Object.keys(guild[key][childKey]),
                                        deeperDefaultObjectKeys = Object.keys(defaultGuildData[key][childKey]);
                                    deeperObjectKeys.forEach(deeperKey => { //If property is object, which is pretty likely, check as well
                                        if (deeperDefaultObjectKeys.includes(deeperKey)) {
                                            defaultGuildData[key][childKey][deeperKey] = guild[key][childKey][deeperKey];
                                        }
                                    });
                                } else if (defaultPropertyObject.includes(childKey)) defaultGuildData[key][childKey] = guild[key][childKey];
                            });
                        } else if (defaultKeys.includes(key)) defaultGuildData[key] = guild[key];
                    });
                    client.guildData.set(guild.id, defaultGuildData);
                    guildsUpdated++;
                });
                let results = {
                    entriesUpdated: guildsUpdated,
                    time: Date.now() - startTime
                };
                resolve(results);
                this.emit("guildDatabaseUpdated", results);
            } catch (err) {
                reject(err);
                client.emit("error", err);
            }
        });
    }

    /**
     * Update the database entries(guilds and users) to the latest data object structure
     * @param {Object} client The client instance
     */
    updateDatabase(client) {
        return new Promise(async(resolve, reject) => {
            const usersUpdate = await this.updateUsers(client);
            const guildsUpdate = await this.updateGuilds(client);
            resolve({
                usersUpdate: usersUpdate,
                guildsUpdate: guildsUpdate
            });
        });
    }
}

module.exports = new DatabaseUpdater();