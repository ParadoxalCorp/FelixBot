exports.run = async(client, message) => {
    try {
        const whitespace = message.content.indexOf(" ");
        if (whitespace === -1) {
            return await message.channel.send(client.getAuthorTags(message));
        }
        const tag = message.content.substr(whitespace + 1).trim();
        if (client.tagDatas.get(tag)) {
            return await message.channel.send(":x: That tag already exist");
        }
        client.awaitReply(message, ":gear: Tag parameter", "What content should this tag contain? Time limit: 60 seconds", 60000).then(async (reply) => {
            const tagDefaultStructure = {
                author: message.author.id,
                content: reply,
                name: tag
            }
            client.tagDatas.set(tag, tagDefaultStructure);
            return await message.channel.send(":white_check_mark: The tag **" + tag + "** has been created");
        })
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["at"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'addtag',
    description: 'Add a tag to the database',
    usage: 'addtag tag name',
    category: 'generic',
    detailledUsage: 'Tags are basically customized output, to run a tag, use `{prefix}t tagname`\n`{prefix}addtag` Will return the list of tags you created'
};