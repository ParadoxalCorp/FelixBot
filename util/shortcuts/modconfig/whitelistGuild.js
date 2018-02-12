module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            if (isNaN(args[1])) return resolve(await message.channel.createMessage(`:x: Invalid guild ID`));
            guildEntry.moderation.inviteFiltering.whitelistedGuilds.includes(args[1]) ?
                guildEntry.moderation.inviteFiltering.whitelistedGuilds.splice(guildEntry.moderation.inviteFiltering.whitelistedGuilds.indexOf(args[1]), 1) :
                guildEntry.moderation.inviteFiltering.whitelistedGuilds.push(args[1]);
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Successfully ${guildEntry.moderation.inviteFiltering.whitelistedGuilds.includes(args[1]) ? 'white-listed' : 'removed from the whitelist'} the guild ${client.guilds.has(args[1]) ? client.guilds.get(args[1]).name + '(' + args[1] + ')' : args[1]}`));
        } catch (err) {
            reject(err);
        }
    });
}