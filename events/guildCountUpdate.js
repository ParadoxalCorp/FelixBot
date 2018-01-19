const request = require(`../util/modules/request.js`);

module.exports = async(client) => {
    //If no discord bot list api key is provided just return, else emit the guildCountUpdate event
    if (client.config.discordBotList) {
        request.post(`https://discordbots.org/api/bots/${client.user.id}/stats`, { server_count: client.guilds.size }, { 'Authorization': client.config.discordBotList })
            .catch(err => {
                client.emit('error', err);
            });
    }
    if (client.config.discordBotFr) {
        const updateDbf = await request.post(`https://discordbot.takohell.com/api/v1/bot/${client.user.id}`, { server_count: client.guilds.size, shard_count: client.shards.size }, { 'Authorization': client.config.discordBotFr, 'Content-Type': 'application/json' })
            .catch(err => {
                client.emit('error', err);
            });
    }
    if (client.config.terminalBotList) {
        const updateTerminal = await request.post(`https://ls.terminal.ink/api/v1/bots/${client.user.id}`, { server_count: client.guilds.size }, { 'Authorization': client.config.terminalBotList, 'Content-Type': 'application/json' })
            .catch(err => {
                client.emit('error', err);
            });
    }
}