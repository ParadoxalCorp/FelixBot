module.exports = async(client, message, args) => {
    /**
     * Shortcut to reset everything
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        if (message.author.id !== message.guild.ownerID) return resolve(await message.channel.send(`:x: Only the owner of the server can use this`))
        const confirmation = await client.awaitReply({
            message: message,
            title: ':warning: Reset confirmation',
            question: `There's no going back, sure you want to do that? Type \`yes\` to confirm or anything else to abort`,
            limit: 30000
        });
        confirmation.question.delete();
        if (!confirmation.reply || confirmation.reply.content.toLowerCase() !== 'yes') {
            let aborting = await message.channel.send(`:x: Reset process aborted`);
            return resolve(aborting.delete(5000));
        } else client.guildData.set(message.guild.id, client.defaultGuildData(message.guild.id))
        resolve(await message.channel.send(`:white_check_mark: Alright, every data about this server got wiped out`));
    });
}