module.exports = async(client, message, args) => {
    /**
     * Shortcut to disable the experience system
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            if (!guildEntry.levelSystem.enabled) return resolve(await message.channel.createMessage(`:x: The experience system is already disabled`));
            guildEntry.levelSystem.enabled = false;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: The experience system has been disabled`));
        } catch (err) {
            reject(err);
        }
    });
}