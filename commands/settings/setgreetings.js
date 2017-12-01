class SetGreetings {
    constructor() {
        this.help = {
            name: 'setgreetings',
            description: 'Set the greetings of the server',
            usage: 'setgreetings',
            detailedUsage: '\n**FLAGS**\n`%USER%` The user that joined the server, will look like `@Bobby`\n`%USERNAME%` The username of the user, will look like `Bobby`\n`%USERTAG%` The username and the discriminator of the user, will look like `Bobby#0000`\n`%GUILD%` The server name, will look like `Bobby\'s server`\n\n`{prefix}setgreetings raw` Will return the raw message(without flags replaced) that has been set'
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
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(message.channel.createMessage("Heads up ! Since the update `3.0.0` this command uses the website, but you can still use the shortcuts if you don't want to use the website ^"));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new SetGreetings();