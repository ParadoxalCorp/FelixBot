class SetFarewell {
    constructor() {
        this.help = {
            name: 'setfarewell',
            description: 'Set the farewell of the server',
            usage: 'setfarewell',
            detailedUsage: '**FLAGS**\n`%USERNAME%` The username of the user, will look like `Bobby`\n`%USERTAG%` The username and the discriminator of the user, will look like `Bobby#0000`\n`%GUILD%` The server name, will look like `Bobby\'s server`'
        }
        this.conf = {
            aliases: ["farewell"],
            guildOnly: true
        }
        this.shortcut = {
            triggers: new Map([
                ['enable', {
                    script: 'enable.js',
                    help: 'Enable the farewell'
                }],
                ['disable', {
                    script: 'disable.js',
                    help: `Disable the farewell(but keep the current settings)`
                }],
                ['set_target', {
                    script: 'setTarget.js',
                    args: 1,
                    help: `Set the target of farewell, use \`channel_name\` to set to a specific channel or \`this\` to set to this channel`
                }],
                ['set_farewell', {
                    script: 'setFarewell.js',
                    help: 'Set the farewell message, flags are allowed'
                }],
                ['settings', {
                    script: 'settings.js',
                    help: 'Display all the parameters set until now(farewell message, target...)'
                }],
                ['simulate', {
                    script: 'simulate.js',
                    help: `Simulate the farewell, the user who triggered the command will be considered as the leaving member`
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(message.channel.createMessage(":x: You should specify something for me to do"));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new SetFarewell();