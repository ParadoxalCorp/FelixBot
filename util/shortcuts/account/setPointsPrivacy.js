module.exports = async(client, message, args) => {
    /**
     * Shortcut to edit points privacy
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            args.shift();
            let privacy = args[0].toLowerCase();
            if (privacy !== 'public' && privacy !== 'private') return resolve(await message.channel.send(`:x: Invalid privacy, must be one of two following: \`Public\`, \`Private\``));
            const userEntry = client.userData.get(message.author.id);
            userEntry.dataPrivacy.publicPoints = privacy === 'public' ? true : false;
            client.userData.set(message.author.id, userEntry);
            resolve(await message.channel.send(`:white_check_mark: The privacy of your points has been successfully set to \`${privacy}\``));
        } catch (err) {
            reject(err);
        }
    });
}