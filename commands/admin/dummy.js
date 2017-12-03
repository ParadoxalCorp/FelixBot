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
                const roles = await message.getRoleResolvable({
                    max: undefined
                });
                resolve(message.channel.createMessage(`Resolved ${roles.map(r => r.name).join(", ")}`));
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Dummy();