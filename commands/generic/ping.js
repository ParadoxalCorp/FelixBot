class Ping {
    constructor() {
        this.help = {
            name: 'ping',
            category: 'generic',
            usage: 'ping',
            description: `Pong ! Display Felix's ping (do people even use this ?)`,
        }
        this.conf = {
            disabled: false,
            guildOnly: false,
            aliases: ["pong"]
        }
    }

    run(client, message) {
        return new Promise(async(resolve, reject) => {
            try {
                let startTime = Date.now();
                resolve(message.channel.createMessage(`Pinging so fast that you won't even notice...`).then(m => m.edit(`Pong ! \`${Date.now() - startTime}\`ms`)));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Ping();