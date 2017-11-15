const request = require(`../util/modules/request.js`);

module.exports = async(client, guild) => {
    if (!client.config.discordBotList) return;
    const updateDbl = await request.post(`https://discordbots.org/api/bots/${client.user.id}/stats`, { server_count: client.guilds.size }, { header: `Authorization`, value: client.config.discordBotList });
    if (!updateDbl.body || !updateDbl.body.length) client.emit('error', `Failed to update guild count on Discord Bot List: ${updateDbl.body}`);
}