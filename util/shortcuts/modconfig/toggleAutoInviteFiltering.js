module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.moderation.inviteFiltering.enabled = guildEntry.moderation.inviteFiltering.enabled ? false : true;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Alright, i ${guildEntry.moderation.inviteFiltering.enabled ? 'enabled' : 'disabled'} the automatic invite filtering`));
        } catch (err) {
            reject(err);
        }
    });
}