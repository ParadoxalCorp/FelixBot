class Dummy {
    constructor() {
        this.help = {
            name: 'dummy',
            description: 'i said dummy',
            usage: 'dummy',
            category: 'admin'
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                let awaitReactions = await message.createReactionCollector(r => r.user.id === message.author.id, {
                    max: 50
                });
                awaitReactions.on("collect", (r) => {
                    console.log(r);
                });
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Dummy();