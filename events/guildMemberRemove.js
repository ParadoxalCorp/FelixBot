'use strict';

class GuildMemberRemoveHandler {
    constructor() {}

    async handle(client, guild, member) {
        if (member.user.bot) {
            return;
        }
        const guildEntry = await client.database.getGuild(guild.id);
        //Farewells
        if (!guildEntry.farewells.channel || !guildEntry.farewells.enabled || !guildEntry.farewells.message) {
            return;
        }
        let message = guildEntry.farewells.message = this.replaceFarewellTags(guild, member, guildEntry.farewells.message);
        let channel = guild.channels.get(guildEntry.farewells.channel);
        if (!channel) {
            return;
        } 
        channel.createMessage(message).catch(() => {});
    }

    replaceFarewellTags(guild, member, message) {
        return message.replace(/\%USERNAME\%/gim, `${member.user.username}`)
        .replace(/\%USERTAG%/gim, `${member.user.tag}`)
        .replace(/\%GUILD\%/gim, `${guild.name}`)
        .replace(/\%MEMBERCOUNT%/gim, guild.memberCount);
    }
}

module.exports = new GuildMemberRemoveHandler();