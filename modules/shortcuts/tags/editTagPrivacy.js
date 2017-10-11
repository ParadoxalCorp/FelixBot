module.exports = async(client, message, args) => {
    /**
     * Shortcut to edit a tag privacy
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        let splitted = message.content.split(/\|/);
        if (splitted.length < 2) return resolve(await message.channel.send(`:x: Invalid syntax, correct syntax example: \`${client.guildData.get(message.guild.id).generalSettings.prefix}tags edit_tag_name [tag_name] | [new_tag_privacy]\``))
        let tagName = splitted[0].split(/\s+/)[2],
            newTagPrivacy = splitted[1].toLowerCase().trim();
        //Handle invalid tag names
        if (!client.tagData.has(tagName) || client.tagData.get(tagName).author !== message.author.id) return resolve(await message.channel.send(`:x: That tag does not exist or someone else created it. In any case you can't edit it :v`));
        if (newTagPrivacy !== 'public' && newTagPrivacy !== 'server-wide' && newTagPrivacy !== 'private') return resolve(await message.channel.send(`:x: Invalid tag privacy, must be one of three following: \`Public\`, \`Private\`, \`Server-wide\``));
        let tag = client.tagData.get(tagName);
        tag.privacy = newTagPrivacy.charAt(0).toUpperCase() + newTagPrivacy.substr(1);
        client.tagData.set(tagName, tag);
        resolve(await message.channel.send(`:white_check_mark: The privacy of the tag \`${tagName}\` was successfully edited to \`${tag.privacy}\``));
    });
}