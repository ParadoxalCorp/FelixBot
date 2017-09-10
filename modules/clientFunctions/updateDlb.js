const unirest = require('unirest');

module.exports = async(client) => {
    /**
     * @returns {Promise<Object>}
     */
    function updateDbl() {
        return new Promise(async(resolve, reject) => {
            client.statsUpdate.latestUpdate = Date.now();
            if (client.config.discordBotList === "") {
                client.statsUpdate.name = "Internal Error",
                    client.statsUpdate.message = "No API key found";
                return reject({
                    sucess: 'No API key found'
                });
            }
            if (client.user.id !== "327144735359762432") {
                client.statsUpdate.name = "Internal Error",
                    client.statsUpdate.message = "Invalid bot";
                return reject({
                    sucess: 'Invalid bot'
                });
            }
            try {
                await unirest.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
                    .header('Authorization', client.database.Data.global[0].discordBotList)
                    .send({
                        server_count: client.guilds.size
                    })
                    .end(function(response) {
                        if (response.body.length > 1) {
                            console.error(result.body);
                            client.statsUpdate.name = "External Error",
                                client.statsUpdate.message = "Discord Bot List returned an empty body";
                            return reject({
                                sucess: 'Internal Discord Bot List Error'
                            });
                        }
                        client.statsUpdate.name = "Update Successful",
                            client.statsUpdate.message = "Server count has been posted successfully";
                        return resolve({
                            sucess: true
                        })
                    });
            } catch (err) {
                console.error(err);
                client.Raven.captureException(err);
                client.statsUpdate.name = "Critical Error",
                    client.statsUpdate.message = "A critical error occured";
                return reject({
                    sucess: 'Critical error',
                    error: err
                });
            }
        });
    }
    client.updateDbl = updateDbl;
}