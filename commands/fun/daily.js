class Daily {
    constructor() {
        this.help = {
            name: 'daily',
            description: 'Get your daily points',
            usage: 'daily'
        }
    }

    run(client, message, args) {
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
                    return resolve(await message.channel.createMessage(`:x: You can only use this command once, time remaining: ${distance.hours}h ${distance.minutes}m ${distance.seconds}s`));
                }
                userEntry.generalSettings.points = userEntry.generalSettings.points + client.config.options.dailyPoints;
                userEntry.cooldowns.dailyCooldown = Date.now() + client.config.options.dailyCooldown;
                client.userData.set(message.author.id, userEntry);
                resolve(await message.channel.createMessage(`You received your **${client.config.options.dailyPoints}** daily points`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Daily();