module.exports = async(client, message, args) => {
    /**
     * Shortcut to reset the prefix
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        const guildEntry = client.guildData.get(message.guild.id);
        guildEntry.generalSettings.prefix = client.config.prefix;
        client.guildData.set(message.guild.id, guildEntry);
        resolve(await message.channel.send(`:white_check_mark: Alright, the prefix has been reset to \`${client.config.prefix}\``));
    });
}