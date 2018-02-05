module.exports = async(client, guild) => {
    //Create a database entry for the new guild if there was not already one
    if (!client.guildData.has(guild.id)) client.guildData.set(guild.id, client.defaultGuildData(guild.id));
}