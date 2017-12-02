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
                userEntry.generalSettings.points = parseInt(args[0]);
                client.userData.set(message.author.id, userEntry);
                resolve(message.channel.createMessage(`:white_check_mark: Successfully set your points to **${args[0]}**`))
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Dummy();