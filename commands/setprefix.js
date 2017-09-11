exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/gim);
            args.shift();
            const guildEntry = client.guildData.get(message.guild.id);
            if (args.length < 1) return resolve(await message.channel.send(":x: You did not specified a new prefix"));
            else if (args[0].length > 8) return resolve(await message.channel.send(`:x: The prefix cant exceed 8 characters !`));
            guildEntry.generalSettings.prefix = args[0];
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.send(`:white_check_mark: The prefix is now \`${args[0]}\`, from now on commands will look like \`${args[0]}ping\``));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}

exports.conf = {
    permLevel: 2,
    guildOnly: true,
    aliases: ["prefix"],
    disabled: false
}
exports.help = {
    name: 'setprefix',
    description: 'Change Felix\'s prefix',
    usage: 'setprefix new prefix',
    category: 'settings',
    detailledUsage: '`{prefix}setprefix wew.` Will set the prefix to `wew.`, so commands will look like `wew.ping`'
}