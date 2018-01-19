module.exports = async(client, message, args) => {
    /**
     * Shortcut to change the level up notifications 
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            if (!new RegExp(/dm|channel|disabled/gim).test(args[1])) {
                var channel = await message.getChannelResolvable({
                    max: 1
                });
                if (!channel.first()) return resolve(await message.channel.createMessage(`:x: Invalid argument: must be either \`dm\`, \`channel\`, \`channel_resolvable\` or \`disabled\``));
            }
            if (guildEntry.levelSystem.levelUpNotif === (args[1] === "disabled" ? false : (channel ? channel.first().id : args[1]))) return resolve(await message.channel.createMessage(`:x: Level up notifications are already set to \`${args[1]}\``));
            guildEntry.levelSystem.levelUpNotif = args[1] === "disabled" ? false : (channel ? channel.first().id : args[1]);
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Level up notifications have been set to \`${(channel ? "#" + channel.first().name : args[1])}\``));
        } catch (err) {
            reject(err);
        }
    });
}