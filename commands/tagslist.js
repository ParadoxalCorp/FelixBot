exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/);
            args.shift();
            if (args[0]) { //-----------------------------------------------------------Get specified tags info-----------------------------------------------------------------
                let filteredTags = client.tagData.filter(t => JSON.parse(t).privacy === "Public" || JSON.parse(t).guild === message.guild.id || JSON.parse(t).author === message.author.id);
                if (!filteredTags.get(args[0])) return resolve(await message.channel.send(':x: That tag does not exist'));
                const tag = JSON.parse(filteredTags.get(args[0]));
                var embedFields = [];
                embedFields.push({
                    name: ":bookmark: Tag name",
                    value: tag.name,
                    inline: true
                });
                let user = client.users.get(tag.author);
                if (!user) user === "Unknown";
                else user = client.users.get(tag.author).tag;
                embedFields.push({
                    name: ":bust_in_silhouette: Author",
                    value: user,
                    inline: true
                });
                embedFields.push({
                    name: ":spy: Privacy",
                    value: tag.privacy,
                    inline: true
                });
                if (tag.guild) {
                    var guild = client.guilds.get(tag.guild);
                    if (!guild) guild = "Unknown";
                    else guild = client.guilds.get(tag.guild).name;
                    embedFields.push({
                        name: ":desktop: Server",
                        value: guild,
                        inline: true
                    });
                }
                let content = tag.content;
                if (content.length > 124) content = tag.content.substr(0, 121) + "...";
                embedFields.push({
                    name: ":notepad_spiral: Content",
                    value: content,
                    inline: false
                });
                return resolve(await message.channel.send({
                    embed: {
                        color: 3447003,
                        author: {
                            name: "Requested by: " + message.author.tag,
                            icon_url: message.author.avatarURL
                        },
                        fields: embedFields,
                        timestamp: new Date()
                    }
                }));
            } //---------------------------------------------------------------------------------Get tags list--------------------------------------------------------
            let filteredTags = client.tagData.filterArray(t => JSON.parse(t).privacy == 'Public' || JSON.parse(t).guild == message.guild.id || JSON.parse(t).author == message.author.id).map(t => JSON.parse(t).name);
            if (!filteredTags.length) return resolve(await message.channel.send(":x: Seems like there's nothing to show yet"));
            let pageResults = await client.pageResults({
                results: filteredTags
            });
            resolve(await client.createInteractiveMessage(message, {
                description: `Here's the list of the public created tags, this include yours and this server Server-wide tags`,
                content: pageResults.results
            }));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}

exports.conf = {
    disabled: false,
    permLevel: 1,
    aliases: ['taglist'],
    guildOnly: true
}
exports.help = {
    name: 'tagslist',
    description: 'The list of all public tags created',
    usage: 'tagslist',
    category: 'miscellaneous',
    detailledUsage: 'Tags are basically customized output, to run a tag, use `{prefix}t [tagname]`\n`{prefix}tagslist [tagname]` Will return some info about the specified tag'
}