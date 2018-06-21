'use strict';

class GuildMemberAddHandler {
    constructor() {}

    async handle(client, guild, member) {
        if (member.user.bot) {
            return;
        }
        const guildEntry = await client.database.getGuild(guild.id);
        const clientMember = guild.members.get(client.bot.user.id);
        const user = client.extendedUser(member.user);
        //On join role
        if (guildEntry.onJoinRoles[0] && clientMember.permission.has('manageRoles')) {
            this.addRoles(guild, member, guildEntry).catch(() => {});
        }
        //Greetings
        if (!guildEntry.greetings.channel || !guildEntry.greetings.enabled || !guildEntry.greetings.message) {
            return;
        }
        let message = guildEntry.greetings.message = this.replaceGreetingsTags(guild, member, guildEntry.greetings.message);
        let channel = guildEntry.greetings.channel === "dm" ? undefined : guild.channels.get(guildEntry.greetings.channel);
        if (guildEntry.greetings.channel !== 'dm' && !channel) {
            return;
        } 
        if (guildEntry.greetings.channel === "dm") {
            user.createMessage(message).catch(() => {});
        } else {
            channel.createMessage(message).catch(() => {});
        }
    }

    async addRoles(guild, member, guildEntry) {
        const existingRoles = guildEntry.onJoinRoles.filter(r => guild.roles.has(r)); //Filter roles that are no more
        if (existingRoles[0]) {
            await Promise.all(existingRoles.map(r => member.addRole(r, `The role is set to be given to new members`))).catch(() => {});
        }
    }

    replaceGreetingsTags(guild, member, message) {
        return message.replace(/\%USER\%/gim, `<@!${member.user.id}>`)
        .replace(/\%USERNAME\%/gim, `${member.user.username}`)
        .replace(/\%USERTAG%/gim, `${member.user.tag}`)
        .replace(/\%GUILD\%/gim, `${guild.name}`)
        .replace(/\%MEMBERCOUNT%/gim, guild.memberCount);
    }
}

module.exports = new GuildMemberAddHandler();