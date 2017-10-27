module.exports = async(client, message, args) => {
    /**
     * Shortcut to change the target of the farewell
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        const guildEntry = client.guildData.get(message.guild.id);
        let getChannels = await message.getChannelResolvable(message);
        if (!getChannels.first()) return resolve(await message.channel.send(`:x: I couldn't find the channel you specified`));
        guildEntry.onEvent.guildMemberRemove.farewell.dm = false;
        guildEntry.onEvent.guildMemberRemove.farewell.channel = getChannels.first().id;
        client.guildData.set(message.guild.id, guildEntry);
        resolve(await message.channel.send(`:white_check_mark: I will now send the greetings in \`#${getChannels.first().name}\``));
    });
}