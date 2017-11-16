class Maintenance {
    constructor() {
        this.help = {
            name: `maintenance`,
            category: `admin`,
            usage: `maintenance`,
            description: `[Owner only] Set the maintenance status, which when on disable felix outputs to all other users than the owner`
        };
        this.conf = {
            ownerOnly: true
        }
    }

    run(client, message) {
        return new Promise(async(resolve, reject) => {
            try {
                await client.editStatus(client.maintenance ? "online" : "dnd");
                client.maintenance = client.maintenance ? false : true;
                resolve(await message.channel.createMessage(`:white_check_mark: Maintenance status has been set to ${client.maintenance ? "on" : "off"}`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Maintenance();