exports.run = async(client, message) => {
    try {
        const whitespace = message.content.indexOf(" ");
        const page = client.searchForParameter(message, "page");
        if ((whitespace === -1) || (page)) {
            return await message.channel.send(client.pageResults(message, "Here's the tags you created.", client.getAuthorTags(message)));
        }
        const tag = message.content.substr(whitespace + 1).trim();
        if (!client.tagDatas.get(tag)) {
            return await message.channel.send(":x: That tag does not exist");
        }
        const tagEntry = client.tagDatas.get(tag);
        if (tagEntry.author !== message.author.id) {
            return await message.channel.send(":x: Only the author of this tag can edit it");
        }
        client.awaitReply(message, ":gear: Tag edition", "What is the new content of this tag? Time limit: 60 seconds").then(async(reply) => {
            if (reply.reply.content.search(/(@everyone|@here|\<@)/gim) !== -1) {
                return await message.channel.send(":x: You can't add a mention to a tag, sorry");
            }
            const privacy = ["Global", "Server-wide", "Personal"];
            var i = 1;
            client.awaitReply(message, ":gear: Tag parameter", "What's this tag privacy? ```\n" + privacy.map(p => `[${i++}] ${p}`).join("\n") + "```").then(async(privacyReply) => {
                if (!reply) {
                    return await message.channel.send(":x: Command aborted");
                }
                if (typeof privacy[privacyReply.reply.content - 1] === "undefined") {
                    return await message.channel.send(":x: You did not specified a number");
                } else if (privacyReply.reply.content > privacy.length || privacyReply.reply.content < 1) {
                    return await message.channel.send(":x: The number you entered is not valid");
                }
                var guild = false;
                if (privacy[privacyReply.reply.content - 1] === "Server-wide") {
                    guild = message.guild.id;
                }                
                tagEntry.content = reply.reply.content;
                tagEntry.privacy = privacy[privacyReply.reply.content - 1];
                tagEntry.guild = guild;
                client.tagDatas.set(tag, tagEntry);
                return await message.channel.send(":white_check_mark: Alright, i edited the tag **" + tag + "**");
            })
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
    guildOnly: true,
    aliases: ["et"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'edittag',
    description: 'Edit a tag from the database, you can of course only edit yours',
    usage: 'edittag tagname',
    category: 'generic',
    detailledUsage: 'Tags are basically customized output, to run a tag, use `{prefix}t tagname`\n`{prefix}edittag` Will return the list of tags you created\n-**Privacy:** You can select between the three following privacy settings: \n=>`Global` Your tag will be accessible by everyone, from every server\n=>`Server-wide` Your tag will be accessible only in the server you added it(you can change the server by editing it though) and will appear on the created tags list only on this server(Unless you trigger the list)\n=>`Personal` Nobody besides you can access to this tag, and it will not appear in the created tags list unless you trigger the list'
};
