module.exports = async(client, message, args) => {
    /**
     * Shortcut to set the farewell message
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        args.shift();
        const guildEntry = client.guildData.get(message.guild.id);
        guildEntry.onEvent.guildMemberRemove.farewell.message = args.join(' ');
        client.guildData.set(message.guild.id, guildEntry);
        resolve(await message.channel.send(`:white_check_mark: Alright, the farewell message has been updated`));
    });
}