exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const userEntry = client.userData.get(message.author.id);
            const convertToTime = function(timestamp) { //Time converter function in case
                return {
                    hours: Math.floor((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((timestamp % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((timestamp % (1000 * 60)) / 1000)
                }
            }
            if (userEntry.cooldowns.dailyCooldown > Date.now()) {
                let distance = convertToTime((userEntry.cooldowns.dailyCooldown - Date.now()));
                return resolve(await message.channel.send(`:x: You can only use this command once, time remaining: ${distance.hours}h ${distance.minutes}m ${distance.seconds}s`));
            }
            userEntry.generalSettings.points = userEntry.generalSettings.points + 500;
            userEntry.cooldowns.dailyCooldown = Date.now() + 86400000;
            client.userData.set(message.author.id, userEntry);
            resolve(await message.channel.send("You received your **500** daily points"));
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
    name: 'daily',
    description: 'Get your 500 daily points',
    usage: 'daily',
    category: 'fun',
};