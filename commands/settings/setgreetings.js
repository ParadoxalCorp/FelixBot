class SetGreetings {
    constructor() {
        this.help = {
            name: 'setgreetings',
            description: 'Set the greetings of the server',
            usage: 'setgreetings enable',
            detailedUsage: '\n**FLAGS**\n`%USER%` The user that joined the server, will look like `@Bobby`\n`%USERNAME%` The username of the user, will look like `Bobby`\n`%USERTAG%` The username and the discriminator of the user, will look like `Bobby#0000`\n`%GUILD%` The server name, will look like `Bobby\'s server`\n`%MEMBERCOUNT%` The new member count of the server, this may be off for servers over 200 members'
        }
        this.conf = {
            guildOnly: true,
            aliases: ['greetings']
        }
        this.shortcut = {
            triggers: new Map([
                ['enable', {
                    script: 'enable.js',
                    help: 'Enable the greetings'
                }],
                ['disable', {
                    script: 'disable.js',
                    help: `Disable the greetings(but keep the current settings)`
                }],
                ['set_target', {
                    script: 'setTarget.js',
                    args: 1,
                    help: `Set the target of greetings, use \`channel_name\` to target a channel or \`dm\` to target the new member direct messages`
                }],
                ['set_greetings', {
                    script: 'setGreetings.js',
                    help: 'Set the greetings message, flags are allowed'
                }],
                ['settings', {
                    script: 'settings.js',
                    help: 'Display all the parameters set until now(greetings message, target...)'
                }],
                ['simulate', {
                    script: 'simulate.js',
                    help: `Simulate the greetings, the user who triggered the command will be considered as the new member`
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

module.exports = new SetGreetings();