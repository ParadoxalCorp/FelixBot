class Dummy {
    constructor() {
        this.help = {
            name: 'dummy',
            description: 'i said dummy',
            usage: 'dummy'
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const userEntry = client.userData.get(message.author.id);
                userEntry.generalSettings.points = 656564163;
                client.userData.set(message.author.id, userEntry);
                resolve(await message.channel.createMessage(`:white_check_mark: you now have 656564163 points`));
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Dummy();