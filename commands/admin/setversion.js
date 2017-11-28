class Setversion {
    constructor() {
        this.help = {
            name: 'setversion',
            usage: 'setversion 6.6.6',
            description: 'Set the version of Felix, which will be displayed'
        }
    }

    run(client, message, args) {
        const fs = require('fs-extra');
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) return resolve(message.channel.send(`:x: You little scrub thought you could set the version to nothing, eh? eh?`));
                const backup = client.backups.get("core-data");
                backup.version = args[0];
                let file = await fs.readFile(`./config/core-data.json`);
                file = JSON.parse(file);
                file.version = args[0];
                await fs.writeFile(`./config/core-data.json`, JSON.stringify(file), (err) => {
                    if (err) {
                        resolve(message.channel.send(`:x: An error occurred: ${err}`));
                    }
                });
                resolve(message.channel.send(`:white_check_mark: The version has successfully been set to \`${args[0]}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Setversion();