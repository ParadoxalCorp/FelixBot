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
                resolve(await message.channel.createMessage(`:x: You should specify something for me to do`));
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Autorole();