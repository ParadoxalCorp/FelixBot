module.exports = async(client) => {
    client.updateDatabase = function(client) {
        return new Promise(async(resolve, reject) => {
            const updateStatus = {
                usersUpdate: {
                    sucess: false,
                    error: false
                },
                guildsUpdate: {
                    sucess: false,
                    error: false
                },
                overallSucess: false
            }
            let userUpdateTime = Date.now();
            let guildUpdateTime = Date.now();
            try {
                client.userData.forEach(function(user) {
                    user = JSON.parse(user);
                    var defaultUserData = client.defaultUserData(user.id);
                    var userKeys = Object.keys(user),
                        defaultKeys = Object.keys(defaultUserData);
                    userKeys.forEach(function(key) {
                        if (typeof user[key] === "object" && defaultUserData[key]) {
                            let userPropertyObject = Object.keys(user[key]),
                                defaultPropertyObject = Object.keys(defaultUserData[key]);
                            userPropertyObject.forEach(function(childKey) { //If property is object, which is pretty likely, check as well
                                if (defaultPropertyObject.includes(childKey)) {
                                    defaultUserData[key][childKey] = user[key][childKey];
                                }
                            });
                        } else if (defaultKeys.includes(key)) {
                            defaultUserData[key] = user[key];
                        }
                    });
                    client.userData.set(user.id, defaultUserData);
                });
                console.info("Updated " + client.userData.size + " entries in the user database, took " + (Date.now() - userUpdateTime) + "ms");
                updateStatus.usersUpdate.sucess = true;
            } catch (err) {
                console.error(err);
                updateStatus.usersUpdate.error = err;
                client.Raven.captureException(err);
            }
            try {
                client.guildData.forEach(function(guild) {
                    guild = JSON.parse(guild);
                    var defaultGuildData = client.defaultGuildData;
                    var guildKeys = Object.keys(guild),
                        defaultKeys = Object.keys(defaultGuildData);
                    guildKeys.forEach(function(key) {
                        if (typeof guild[key] === "object" && defaultGuildData[key]) {
                            let guildPropertyObject = Object.keys(guild[key]),
                                defaultPropertyObject = Object.keys(defaultGuildData[key]);
                            guildPropertyObject.forEach(function(childKey) { //If property is object, which is pretty likely, check as well
                                if (defaultPropertyObject.includes(childKey)) {
                                    defaultGuildData[key][childKey] = guild[key][childKey];
                                }
                            });
                        } else if (defaultKeys.includes(key)) {
                            defaultGuildData[key] = guild[key];
                        }
                    });
                    client.guildData.set(guild.id, defaultGuildData);
                });
                console.info("Updated " + client.guildData.size + " entries in the guild database, took " + (Date.now() - guildUpdateTime) + "ms");
                updateStatus.guildsUpdate.sucess = true;
            } catch (err) {
                console.error(err);
                updateStatus.guildsUpdate.error = err;
                client.Raven.captureException(err);
            }
            if (!updateStatus.usersUpdate.error && !updateStatus.guildsUpdate.error) {
                updateStatus.overallSucess = true;
                console.log(updateStatus);
                resolve(updateStatus);
            } else {
                console.error(updateStatus);
                reject(updateStatus);
            }
        });
    }
}