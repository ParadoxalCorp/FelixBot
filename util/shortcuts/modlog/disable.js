module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);

            if (!guildEntry.modLog.channel) return resolve(await message.channel.createMessage(`:x: The mod-log is already disabled`));
            guildEntry.modLog.channel = false
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: The mod-log has successfully been disabled`));
        } catch (err) {
            reject(err);
        }
    });
}