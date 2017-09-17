const unirest = require('unirest');

module.exports = async(client) => {
    /**
     * @returns {Promise<Object>}
     */
    function updateDbl() {
        return new Promise(async(resolve, reject) => {
            client.statsUpdate.latestUpdate = Date.now();
            if (client.config.discordBotList === "") {
                client.statsUpdate.success.name = "Internal Error",
                    client.statsUpdate.success.message = "No API key found";
                return reject({
                    success: 'No API key found'
                });
            }
            if (client.user.id !== "327144735359762432") {
                client.statsUpdate.success.name = "Internal Error",
                    client.statsUpdate.success.message = "Invalid bot";
                return reject({
                    success: 'Invalid bot'
                });
            }
            try {
                await unirest.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
                    .header('Authorization', client.database.discordBotList)
                    .send({
                        server_count: client.guilds.size
                    })
                    .end(function(response) {
                        if (response.body.length > 1) {
                            console.error(result.body);
                            client.statsUpdate.success.name = "External Error",
                                client.statsUpdate.success.message = "Discord Bot List returned an empty body";
                            return reject({
                                success: 'Internal Discord Bot List Error'
                            });
                        }
                        client.statsUpdate.success.name = "Update Successful",
                            client.statsUpdate.success.message = "Server count has been posted successfully";
                        return resolve({
                            success: true
                        })
                    });
            } catch (err) {
                console.error(err);
                client.Raven.captureException(err);
                client.statsUpdate.name = "Critical Error",
                    client.statsUpdate.message = "A critical error occured";
                return reject({
                    success: 'Critical error',
                    error: err
                });
            }
        });
    }
    client.updateDbl = updateDbl;
}