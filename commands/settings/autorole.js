class Autorole {
    constructor() {
        this.help = {
            name: 'autorole',
            description: 'Set the self-assignables roles',
            usage: 'autorole'
        }
        this.conf = {
            aliases: ["selfrole"],
            guildOnly: true,
            cooldownWeight: 4
        }
        this.shortcut = {
            triggers: new Map([
                ['add_role', {
                    script: 'addRole.js',
                    args: 1,
                    help: 'Add a role to the auto-assignables list'
                }],
                ['remove_role', {
                    script: 'removeRole.js',
                    args: 1,
                    help: 'Remove a role from the auto-assignables roles list'
                }],
                ['list', {
                    script: 'list.js',
                    args: 0,
                    help: 'Show the list of self-assignable roles'
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(await message.channel.createMessage(`Heads up ! Since update \`3.0.0\`, this command uses the website, but you can still use the shortcuts if you don't want to use the website ^`));
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Autorole();