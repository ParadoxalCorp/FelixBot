module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.moderation.inviteFiltering.warnMessage = args[1] ? args.join(' ') : false;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Alright, i ${guildEntry.moderation.inviteFiltering.warnMessage ? 'updated' : 'disabled'} the warn message`));
        } catch (err) {
            reject(err);
        }
    });
}