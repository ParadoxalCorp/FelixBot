const request = require(`../util/modules/request.js`);

module.exports = async(client) => {
    //If no discord bot list api key is provided just return, else emit the guildCountUpdate event
    if (client.config.discordBotList) {
        const updateDbl = await request.post(`https://discordbots.org/api/bots/${client.user.id}/stats`, { server_count: client.guilds.size }, { header: `Authorization`, value: client.config.discordBotList });
        if (!updateDbl.body || !updateDbl.body.length) client.emit('error', `Failed to update guild count on Discord Bot List: ${updateDbl.body}`);
    }
    if (client.config.discordBotFr) {
        const updateDbf = await request.post(`https://discordbot.takohell.com/api/v1/bots/${client.user.id}`, { server_count: client.guilds.size }, { header: `Authorization`, value: client.config.discordBotFr });
        if (!updateDbf.body) client.emit('error', `Failed to update guild count on Discord Bot List: ${updateDbf.body}`);
    }
    if (client.config.terminalBotList) {
        const updateTerminal = await request.post(`https://ls.terminal.ink/api/v1/bots/${client.user.id}`, { server_count: client.guilds.size }, { header: `Authorization`, value: client.config.terminalBotList });
        if (!updateTerminal.body) client.emit('error', `Failed to update guild count on Discord Bot List: ${updateTerminal.body}`);
    }
}