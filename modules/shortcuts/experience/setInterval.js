module.exports = async(client, message, args) => {
    /**
     * Shortcut to set the downgrade/upgrade interval
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        const guildEntry = client.guildData.get(message.guild.id);
        if (isNaN(args[1])) return resolve(await message.channel.send(`:x: Specified duration is expected to be in milliseconds`));
        if (args[1] < 360000) return resolve(await message.channel.send(`:x: That interval is too low !`));
        guildEntry.generalSettings.levelSystem.interval = Math.round(Number(args[1]));
        client.guildData.set(message.guild.id, guildEntry);
        resolve(await message.channel.send(`:white_check_mark: The interval has been set to \`${args[1]}ms\``));
    });
}