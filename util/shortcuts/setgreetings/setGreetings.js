module.exports = async(client, message, args) => {
    /**
     * Shortcut to set the greetings message
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        args.shift();
        const guildEntry = client.guildData.get(message.guild.id);
        guildEntry.onEvent.guildMemberAdd.greetings.message = args.join(' ');
        client.guildData.set(message.guild.id, guildEntry);
        resolve(await message.channel.createMessage(`:white_check_mark: Alright, the greetings message has been updated`));
    });
}