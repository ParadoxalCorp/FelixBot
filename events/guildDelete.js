module.exports = async(client, guild) => {
    //Create a database entry for the new guild if there was not already one
    const guildEntry = client.guildData.get(guild.id);
    if (!guildEntry) return;
    guildEntry.generalSettings.leftAt = Date.now();
    client.guildData.set(guild.id, guildEntry);
}