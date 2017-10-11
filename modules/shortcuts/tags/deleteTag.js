module.exports = async(client, message, args) => {
    /**
     * Shortcut to delete a tag
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        let tagName = args[1];
        //Handle invalid tag names
        if (!client.tagData.has(tagName) || client.tagData.get(tagName).author !== message.author.id) return resolve(await message.channel.send(`:x: That tag does not exist or was created by another user. Therefore, it can't be deleted`));
        client.tagData.delete(tagName);
        resolve(await message.channel.send(`:white_check_mark: The tag \`${tagName}\` was successfully deleted`));
    });
}