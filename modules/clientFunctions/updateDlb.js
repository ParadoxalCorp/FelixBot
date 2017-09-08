const unirest = require('unirest');

module.exports = async(client) => {
    /**
     * @returns {Promise<Object>}
     */
    function updateDbl() {
        return new Promise(async(resolve, reject) => {
            if (client.config.discordBotList === "") return reject({
                sucess: 'No API key found'
            });
            if (client.user.id !== "327144735359762432") return reject({
                sucess: 'Invalid bot'
            });
            try {
                await unirest.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
                    .header('Authorization', client.database.Data.global[0].discordBotList)
                    .send({
                        server_count: client.guilds.size
                    })
                    .end(function(response) {
                        if (response.body.length > 1) {
                            console.error(result.body);
                            return reject({
                                sucess: 'Internal Discord Bot List Error'
                            });
                        }
                        return resolve({
                            sucess: true
                        })
                    });
            } catch (err) {
                console.error(err);
                client.Raven.captureException(err);
                return reject({
                    sucess: 'Critical error',
                    error: err
                });
            }
        });
    }
    client.updateDbl = updateDbl;
}