exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            //Get the tag name
            let args = message.content.split(/\s+/);
            args.shift();
            const tagCommand = args[0];
            //Search for the tags through the filtered list
            if (!client.tagData.filter(t => t.privacy === "Public" || t.guild === message.guild.id || t.author === message.author.id).get(tagCommand)) return resolve(await message.channel.send(":x: That tag does not exist or is private"));
            //"Run" the tag
            resolve(await message.channel.send(client.tagData.get(tagCommand).content));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
}

exports.conf = {
    guildOnly: true,
    aliases: ["runtag"],
    disabled: false
};

exports.help = {
    name: 't',
    description: 'Run a tag',
    usage: 't [tag_name]',
    category: 'misc'
};