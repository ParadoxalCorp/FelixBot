module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            let channel = await message.getChannelResolvable({
                max: 1
            });
            if (!channel.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the corresponding channel`));
            if (channel.first().id === guildEntry.modLog.channel) {
                return resolve(await message.channel.createMessage(`:x: The channel \`#${channel.first().name}\` is already set as the mod-log channel`));
            }
            guildEntry.modLog.channel = channel.first().id;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: \`#${channel.first().name}\` has been set as the mod-log channel`));
        } catch (err) {
            reject(err);
        }
    });
}