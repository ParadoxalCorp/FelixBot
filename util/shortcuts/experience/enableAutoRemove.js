module.exports = async(client, message, args) => {
    /**
     * Shortcut to enable the automatic removal system
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            if (guildEntry.levelSystem.autoRemove) return resolve(await message.channel.createMessage(`:x: The automatic removal of roles is already enabled`));
            guildEntry.levelSystem.autoRemove = true;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: The automatic removal of roles has been enabled`));
        } catch (err) {
            reject(err);
        }
    });
}