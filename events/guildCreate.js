module.exports = async(client, guild) => {
    if ((!client.database || !client.database.healthy)) {
        return;
    }
    const guildIsInDb = await client.database.getGuild(guild.id);
    if (!guildIsInDb) {
        await client.database.set(client.refs.guildEntry(guild.id));
    }
};