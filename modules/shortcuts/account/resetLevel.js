module.exports = async(client, message, args) => {
    /**
     * Shortcut to reset global level/exp
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        const confirmation = await client.awaitReply({
            message: message,
            title: ':warning: Reset confirmation',
            question: `There's no going back, you're going to lose your global experience, sure you want to do that? Type \`yes\` to confirm or anything else to abort`,
            limit: 30000
        });
        confirmation.question.delete();
        if (!confirmation.reply || confirmation.reply.content.toLowerCase() !== 'yes') {
            let aborting = await message.channel.send(`:x: Reset process aborted`);
            return resolve(aborting.delete(5000));
        }
        const userData = client.userData.get(message.author.id);
        userData.experience = client.defaultUserData(message.author.id).experience;
        client.userData.set(message.author.id, client.defaultUserData(message.author.id))
        resolve(await message.channel.send(`:white_check_mark: Alright, your global level/experience has been reset`));
    });
}