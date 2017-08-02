exports.run = async(client, message) => {
    try {
        const whitespace = message.content.indexOf(" ");
        if (whitespace === -1) {
            return await message.channel.send(client.getAuthorTags(message));
        }
        const tag = message.content.substr(whitespace + 1).trim();
        if (!client.tagDatas.get(tag)) {
            return await message.channel.send(":x: That tag does not exist");
        }
        const tagEntry = client.tagDatas.get(tag);        
        if (tagEntry.author !== message.author.id) {
            return await message.channel.send(":x: Only the author of this tag can delete it");
        }
        client.tagDatas.delete(tag);
        return await message.channel.send(":white_check_mark: The tag **" + tag + "** has been deleted");
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
    aliases: ["dt"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'deletetag',
    description: 'Remove a tag from the database',
    usage: 'deletetag tag name',
    category: 'generic',
    detailledUsage: 'Tags are basically customized output, to run a tag, use `{prefix}t tagname`\n`{prefix}deletetag` Will return the list of tags you created'
};