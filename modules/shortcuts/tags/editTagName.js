module.exports = async(client, message, args) => {
    /**
     * Shortcut to edit a tag name
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        let splitted = message.content.split(/\|/);
        if (splitted.length < 2) return resolve(await message.channel.send(`:x: Invalid syntax, correct syntax example: \`${client.guildData.get(message.guild.id).generalSettings.prefix}tags edit_tag_name [tag_name] | [new_tag_name]\``))
        let tagName = splitted[0].split(/\s+/)[2],
            newTagName = splitted[1].trim();
        //Handle invalid tag names
        if (!client.tagData.has(tagName) || client.tagData.get(tagName).author !== message.author.id) return resolve(await message.channel.send(`:x: That tag does not exist or someone else created it. In any case you can't rename it :v`));
        if (client.tagData.has(newTagName)) return resolve(await message.channel.send(`:x: The tag \`${newTagName}\` already exist`));
        client.tagData.set(newTagName, client.tagData.get(tagName));
        client.tagData.delete(tagName);
        resolve(await message.channel.send(`:white_check_mark: The tag \`${tagName}\` was successfully renamed to \`${newTagName}\``));
    });
}