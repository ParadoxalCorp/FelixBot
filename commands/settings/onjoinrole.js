class OnJoinRole {
    constructor() {
        this.help = {
            name: 'onjoinrole',
            description: 'Set the role(s) that Felix will give to new members',
            usage: 'onjoinrole'
        }
        this.conf = {
            guildOnly: true
        }
        this.shortcut = {
            triggers: new Map([
                ['add_role', {
                    script: 'addRole.js',
                    args: 1,
                    help: 'Add a role to the list of roles to give to new members'
                }],
                ['remove_role', {
                    script: 'removeRole.js',
                    args: 1,
                    help: 'Remove a role from the list of roles to give to new members'
                }],
                ['list', {
                    script: 'list.js',
                    args: 0,
                    help: 'Show the list of roles set to be given to new members'
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(message.channel.createMessage(`:x: You should specify something for me to do`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new OnJoinRole();