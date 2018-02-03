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
                message.delete().catch(err => reject(err));
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Dummy();