'use strict';

class GuildCreateHandler {
    constructor() {}

    async handle(client, guild) {
        if (!client.database || !client.database.healthy) {
            return;
        }
        const guildIsInDb = await client.database.getGuild(guild.id);
        if (!guildIsInDb) {
            client.database.set(client.refs.guildEntry(guild.id))
                .catch(err => {
                    client.bot.emit('error', err);
                });
        }
    }
}

module.exports = new GuildCreateHandler();