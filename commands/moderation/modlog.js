class Modlog {
    constructor() {
        this.help = {
            name: 'modlog',
            usage: 'modlog set_channel <channel_name>',
            description: "Setup the mod-log channel, in which moderation actions (e.g ban, kick...) will be logged"
        }
        this.conf = {
            guildOnly: true
        }
        this.shortcut = {
            triggers: new Map([
                ['set_channel', {
                    script: 'setChannel.js',
                    help: 'Set the mod-log channel',
                    args: 1
                }],
                ['disable', {
                    script: 'disable.js',
                    help: 'Remove the mod-log channel'
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(await message.channel.createMessage(`:x: You did not specify anything to do ;-;`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Modlog();