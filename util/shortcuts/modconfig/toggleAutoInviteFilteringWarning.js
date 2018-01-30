module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.moderation.inviteFiltering.warn = guildEntry.moderation.inviteFiltering.warn ? false : true;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Alright, i ${guildEntry.moderation.inviteFiltering.warn ? 'enabled' : 'disabled'} the warnings whenever a user send an invite to another/not white-listed server`));
        } catch (err) {
            reject(err);
        }
    });
}