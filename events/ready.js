const unirest = require("unirest");
module.exports = async(client) => {
    const getRandomNumber = function(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var upvoters = async function() {
        return new Promise(async(resolve, reject) => {
            try {
                fetch: {
                    await unirest.get(`https://discordbots.org/api/bots/327144735359762432/votes?onlyids=true`)
                    .header('Authorization', client.database.Data.global[0].discordBotList)
                    .end(async function(result) {
                        if (!Array.isArray(result.body)) {
                            console.error(result.body);
                            resolve(false);
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
        client.user.setPresence({ game: { name: `${upvoterText} ${client.database.Data.global[0].prefix}help for commands | On ${client.guilds.size} servers`, type: 0 } });
    }, 1000); //Wait db load
    setInterval(function() {
        if (upvoters) { //Regenerate random number
            var random = getRandomNumber(confirmedUpvoters.length - 1, 0);
            upvoterText = `with ${confirmedUpvoters[getRandomNumber(confirmedUpvoters.length - 1, 0)]} |`
        }
        client.user.setPresence({ game: { name: `${upvoterText} ${client.database.Data.global[0].prefix}help for commands | On ${client.guilds.size} servers`, type: 0 } });
    }, 60000);
}