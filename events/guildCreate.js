const request = require(`../util/modules/request.js`);

module.exports = async(client, guild) => {
    //Create a database entry for the new guild if there was not already one
    if (!client.guildData.has(guild.id)) client.guildData.set(guild.id, client.defaultGuildData(guild.id));
    //If no discord bot list api key is provided just return, else post the new server count
    if (!client.config.discordBotList) return;
    const updateDbl = await request.post(`https://discordbots.org/api/bots/${client.user.id}/stats`, { server_count: client.guilds.size }, { header: `Authorization`, value: client.config.discordBotList });
    if (!updateDbl.body || !updateDbl.body.length) client.emit('error', `Failed to update guild count on Discord Bot List: ${updateDbl.body}`);
}