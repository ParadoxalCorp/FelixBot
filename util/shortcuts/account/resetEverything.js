module.exports = async(client, message, args) => {
    /**
     * Shortcut to reset everything
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const confirmation = await message.awaitReply({
                message: {
                    embed: {
                        title: ':warning: Reset confirmation',
                        description: `There's no going back, you're going to lose your global experience, love points, points... sure you want to do that? Type \`yes\` to confirm or anything else to abort`
                    }
                },
                timeout: 30000
            });
            confirmation.query.delete();
            if (!confirmation.reply || confirmation.reply.content.toLowerCase() !== 'yes') {
                message.channel.send(`:x: Reset process aborted`).then(m => m.delete(5000));
            } else client.userData.set(message.author.id, client.defaultUserData(message.author.id))
            resolve(await message.channel.send(`:white_check_mark: Alright, all your data are back to default`));
        } catch (err) {
            reject(err);
        }
    });
}