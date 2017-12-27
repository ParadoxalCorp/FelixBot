module.exports = async(client, message, args) => {
    /**
     * Shortcut to enable the experience system
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            if (guildEntry.generalSettings.levelSystem.enabled) return resolve(await message.channel.createMessage(`:x: The experience system is already enabled`));
            guildEntry.generalSettings.levelSystem.enabled = true;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: The experience system has been enabled`));
        } catch (err) {
            reject(err);
        }
    });
}