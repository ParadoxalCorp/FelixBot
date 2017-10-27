module.exports = async(client, message, args) => {
    /**
     * Shortcut to change the target of greetings
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        const guildEntry = client.guildData.get(message.guild.id);
        let target;
        if (args[1].toLowerCase() === "dm") {
            guildEntry.onEvent.guildMemberAdd.greetings.dm = true;
            guildEntry.onEvent.guildMemberAdd.greetings.channel = false;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.send(`:white_check_mark: Alright, the greetings will now be send directly to the new member`))
        } else {
            let getChannels = await message.getChannelResolvable();
            if (!getChannels.first()) return resolve(await message.channel.send(`:x: I couldn't find the channel you specified`));
            guildEntry.onEvent.guildMemberAdd.greetings.dm = false;
            guildEntry.onEvent.guildMemberAdd.greetings.channel = getChannels.first().id;
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.send(`:white_check_mark: I will now send the greetings in \`#${getChannels.first().name}\``))
        }
    });
}