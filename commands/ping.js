exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            startTime = Date.now();
            await message.channel.send("Writting so fast that you wont even notice...").then(async(message) => {
                endTime = Date.now();
                resolve(await message.edit("Pong ! | `" + Math.round(endTime - startTime) + "`ms"));
            });
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'ping',
    description: 'Pong ! Display Felix\'s ping.',
    usage: 'ping',
    category: 'generic'
};