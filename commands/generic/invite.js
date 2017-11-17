class Invite {
    constructor() {
        this.help = {
            name: 'invite',
            description: 'Get Felix\'s invite link',
            usage: 'invite',
            category: 'generic',
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(await message.channel.send(`Here's my invite link :wave: <https://discordapp.com/oauth2/authorize?&client_id=${client.user.id}&scope=bot&permissions=2146950271> \nPlease remember that i might not work perfectly if i dont have all permissions~`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Invite();