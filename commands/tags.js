exports.run = async(client, message) => {
    try {
        const whitespace = message.content.indexOf(" ");
        const page = client.searchForParameter(message, "page");
        const mine = client.searchForParameter(message, "mine", {
            aliases: ["-mine", "-m"],
            name: "mine"
        });
        if ((whitespace === -1) || (page && !mine)) {
            const createdTags = client.pageResults(message, "", Array.from(client.tagDatas.filter(t => (JSON.parse(t).privacy === "Global") || (JSON.parse(t).privacy === "Server-wide" && JSON.parse(t).guild === message.guild.id) || (JSON.parse(t).author === message.author.id)).map(t => JSON.parse(t).name)), 20, true);
            if (typeof createdTags !== "object") {
                return await message.channel.send(createdTags);
            } 
            return await message.channel.send("Here's the created tags list, showing page " + createdTags.page + ". You can navigate through pages using `" + client.guildDatas.get(message.guild.id).prefix + client.commands.get(this.help.name).help.name + " -page 2` for example\n" + createdTags.results.map(t => `\`${t}\``).join(", "));
        } else if (mine) {
            return await message.channel.send(client.pageResults(message, "Here's the tags you created. ", client.getAuthorTags(message)));
        } else if (whitespace !== -1) {
            const tagName = message.content.substr(whitespace + 1).trim();
            const availableTags = client.tagDatas.filter(t => (JSON.parse(t).privacy === "Global") || (JSON.parse(t).privacy === "Server-wide" && JSON.parse(t).guild === message.guild.id) || (JSON.parse(t).author === message.author.id));
            if (!availableTags.get(tagName)) {
                return await message.channel.send(":x: That tag does not exist");
            }
            const tag = JSON.parse(availableTags.get(tagName));
            var embedFields = [];
            console.log(tag);
            if (tag.name) {
                embedFields.push({
                    name: ":bookmark: Tag name",
                    value: tag.name,
                    inline: true
                });
            }
            if (tag.author) {
                var user = client.users.get(tag.author);
                if (!user) {
                    user === "Unknown";
                } else {
                    user = client.users.get(tag.author).username + "#" + client.users.get(tag.author).discriminator;
                }
                embedFields.push({
                    name: ":bust_in_silhouette: Author",
                    value: user,
                    inline: true
                });
            }
            if (tag.content) {
                var content = tag.content;
                if (content.length > 84) {
                    content = tag.content.substr(0, 81) + "...";
                }
                embedFields.push({
                    name: ":notepad_spiral: Content",
                    value: content,
                    inline: false
                });
            }
            if (tag.privacy) {
                embedFields.push({
                    name: ":spy: Privacy",
                    value: tag.privacy,
                    inline: true
                });
            }
            if (tag.guild) {
                var guild = client.guilds.get(tag.guild);
                if (!guild) {
                    guild = "Unknown";
                } else {
                    guild = client.guilds.get(tag.guild).name;
                }
                embedFields.push({
                    name: ":desktop: Server",
                    value: guild,
                    inline: true
                });
            }
            return await message.channel.send({
                embed: {
                    color: 3447003,
                    author: {
                        name: "Requested by: " + message.author.username + "#" + message.author.discriminator,
                        icon_url: message.author.avatarURL
                    },
                    fields: embedFields,
                    timestamp: new Date()
                }
            }).catch(console.error);
        }
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'tags',
    parameters: "`-mine`",
    description: 'Show all the tags created',
    usage: 'tags',
    category: 'generic',
    detailledUsage: 'Tags are basically customized output, to run a tag, use `{prefix}t tagname`\n`{prefix}tags -mine` Will return the list of tags you created\n`{prefix}tags owo` Will return detailled infos about the tag **owo**\nThe created tags list actually only return tags set as global, this server tags and your tags'
};
