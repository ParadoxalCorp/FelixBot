exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const userEntry = client.userData.get(message.author.id);
            let args = message.content.split(/\s+/gim);
            args.shift();
            if (!args.length) {
                if (userEntry.generalSettings.afk === false) {
                    userEntry.generalSettings.afk = "";
                    client.userData.set(message.author.id, userEntry);
                    resolve(await message.channel.send(`:white_check_mark: Alright, i enabled your afk status`));
                } else {
                    userEntry.generalSettings.afk = false;
                    client.userData.set(message.author.id, userEntry);
                    resolve(await message.channel.send(`:white_check_mark: Alright, i disabled your afk status`));
                }
            } else {
                userEntry.generalSettings.afk = args.join(" ");
                client.userData.set(message.author.id, userEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, i updated your afk status`));
            }
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}

exports.conf = {
    guildOnly: false,
    disabled: false,
    permLevel: 1,
    aliases: []
}
exports.help = {
    name: 'afk',
    usage: 'afk im afk dont bother kthx',
    description: 'Set your afk status, if your afk status is on, Felix will send your fancy afk status to everyone who mention you',
    category: 'generic',
    detailedUsage: '`{prefix}afk` If on, this will disable your afk status, else it will enable your afk status\n`{prefix}afk im sleeping` Will update your afk status to `im sleeping`'
}