const unirest = require("unirest");
module.exports = async(client) => {
    const getRandomNumber = function(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if (client.database.wolkeImageKey !== "") {
        async function updateImageTypes() {
            try {
                fetch: {
                    await unirest.get(`https://api.weeb.sh/images/types`)
                    .header('Authorization', `Bearer ${client.database.wolkeImageKey}`)
                    .end(async function(result) {
                        if (!result.body || result.body.status !== 200) {
                            client.imageTypes.success.name = "External Error";
                            client.imageTypes.success.message = "An error occured within weeb.sh end or the request was wrong";
                            console.error(result.body);
                        } else {
                            client.imageTypes.success.name = "Update successful";
                            client.imageTypes.success.message = "Latest update request was successful";
                        }
                        client.imageTypes.latestUpdate = Date.now();
                        client.imageTypes.types = result.body.types;
                    })
                }
            }
            catch (err) {
                console.error(err);
                client.Raven.captureException(err);
            }
        }
        updateImageTypes();
        //-------------------------Update image types every 12h------------------------------------------
        setInterval(function() { updateImageTypes() }, 43200000);
    }
    if (client.database.discordBotList !== "") { //If key, most likely if not selfhosted
        var upvoters = async function() {
            return new Promise(async(resolve, reject) => {
                try {
                    fetch: {
                        await unirest.get(`https://discordbots.org/api/bots/327144735359762432/votes?onlyids=true`)
                        .header('Authorization', client.database.discordBotList)
                        .end(async function(result) {
                            if (!Array.isArray(result.body)) {
                                console.error(result.body);
                                resolve(upvoters = false);
                            }
                            resolve(upvoters = result.body);
                        });
                    }
                }
                catch (err) {
                    console.error(err);
                    resolve(upvoters = false);
                }
            })
        };
        await upvoters();
        if (upvoters) client.upvotes.users = upvoters;
        //----------------------------Update upvoters every 30 minutes-----------------------------------------
        setInterval(async function() {
            try {
                fetch: {
                    await unirest.get(`https://discordbots.org/api/bots/327144735359762432/votes?onlyids=true`)
                    .header('Authorization', client.database.discordBotList)
                    .end(async function(result) {
                        if (!Array.isArray(result.body)) {
                            console.error(result.body);
                        }
                        client.upvotes.users = upvoters;
                        client.upvotes.latestUpdate = Date.now();
                    });
                }
            }
            catch (err) {
                console.error(err);
                client.Raven.captureException(err);
            }
        }, 1800000);
        //------------------------------------------------------------------------------------------
        var upvoterText = "";
        var confirmedUpvoters = [];
        if (upvoters) {
            upvoters.forEach(function(upvoter) { //Convert to usernames and remove users which "do not use Felix anymore"
                var pos = upvoters.findIndex(function(element) {
                    return element === upvoter;
                });
                var user = client.users.get(upvoter);
                if (user) {
                    confirmedUpvoters.push(client.users.get(upvoter).username + "#" + client.users.get(upvoter).discriminator);
                }
            });
            upvoterText = `with ${confirmedUpvoters[getRandomNumber(confirmedUpvoters.length - 1, 0)]} |`
        }
        setTimeout(function() {
            client.user.setPresence({ game: { name: `${upvoterText} ${client.database.prefix}help for commands | On ${client.guilds.size} servers`, type: 0 } });
        }, 1000); //Wait db load
        setInterval(function() {
            if (upvoters) { //Regenerate random number
                var random = getRandomNumber(confirmedUpvoters.length - 1, 0);
                upvoterText = `with ${confirmedUpvoters[getRandomNumber(confirmedUpvoters.length - 1, 0)]} |`
            }
            client.user.setPresence({ game: { name: `${upvoterText} ${client.database.prefix}help for commands | On ${client.guilds.size} servers`, type: 0 } });
        }, 60000);
    } else {
        client.user.setPresence({ game: { name: `${client.config.prefix}help for commands` } });
    }
}