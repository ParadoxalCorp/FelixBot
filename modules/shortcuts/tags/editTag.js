module.exports = async(client, message, args) => {
    /**
     * Shortcut to edit a tag
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        let splitted = message.content.split(/\|/);
        if (splitted.length < 2) return resolve(await message.channel.send(`:x: Invalid syntax, correct syntax example: \`${client.guildData.get(message.guild.id).generalSettings.prefix}tags add_tag [tag_name] | [tag_content]\``))
        let tagName = splitted[0].split(/\s+/)[2],
            tagContent = splitted[1].trim(),
            tagPrivacy = 'Public',
            tagGuild = false;
        if (splitted[2] && (splitted[2].toLowerCase().trim() === 'public' || splitted[2].toLowerCase().trim() === 'private' || splitted[2].toLowerCase().trim() === 'server-wide')) tagPrivacy = splitted[2].trim().charAt(0).toUpperCase() + splitted[2].trim().substr(1);
        if (tagPrivacy === "Server-wide") tagGuild = message.guild.id;
        //Handle invalid tag names
        if (!client.tagData.has(tagName) || client.tagData.get(tagName).author !== message.author.id) return resolve(await message.channel.send(`:x: That tag does not exist or someone else created it. In any case you can't edit it :v`));
        client.tagData.set(tagName, {
            author: message.author.id,
            content: tagContent,
            name: tagName,
            privacy: tagPrivacy,
            guild: tagGuild
        });
        resolve(await message.channel.send(`:white_check_mark: The tag \`${tagName}\` was successfully edited`));
    });
}