exports.run = async(client, message) => {
    try {
        const whitespace = message.content.indexOf(" ");
        const page = client.searchForParameter(message, "page");
        const mine = client.searchForParameter(message, "mine", {aliases: ["-mine", "-m"], name: "mine"});
        if ((whitespace === -1) || (page && !mine)) {
            return await message.channel.send(client.pageResults(message, "Here's the created tags. ", Array.from(client.tagDatas.map(t => JSON.parse(t).name))));
        } else if (mine) {
            return await message.channel.send(client.pageResults(message, "Here's the tags you created. ", client.getAuthorTags(message)));
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
    guildOnly: false,
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
    detailledUsage: 'Tags are basically customized output, to run a tag, use `{prefix}t tagname`\n`{prefix}tags -mine` Will return the list of tags you created'
};