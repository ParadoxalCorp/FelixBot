class Experience {
    constructor() {
        this.help = {
                name: 'experience',
                usage: 'experience',
                description: 'Enter the activity experience system settings of this server, this allow you to do stuff like disable level up notifications for example',
                detailedUsage: '`{prefix}experience rolelist` Will return a list of all roles sets to be given on level up in which you can add and remove some'
            },
            this.conf = {
                aliases: ["exp"],
                guildOnly: true
            }
        this.shortcut = {
            triggers: new Map([
                ['enable', {
                    script: 'enable.js',
                    help: 'Enable the system, members will win xp by chatting'
                }],
                ['disable', {
                    script: 'disable.js',
                    help: 'Disable the system, current data are preserved'
                }],
                ['add_role', {
                    script: 'addRole.js',
                    help: 'Add a role to be assigned at a specific level/message count\nSyntax: `{prefix}experience add_role [role_name] | ["message"/"experience"] | [count(level/messages)]`\nExample: `{prefix}experience add_role Lurker | message | 10`',
                    args: 5
                }],
                ['remove_role', {
                    script: 'removeRole.js',
                    help: 'Remove a role from the list so it wont be automatically given to members who reach the set xp count/message count',
                    args: 1
                }],
                ['rolelist', {
                    script: 'roleList.js',
                    help: 'Display the list of the roles set to be given at some point'
                }],
                ['nuke_users', {
                    script: 'nukeUsers.js',
                    help: 'Nuke the users activity stats(experience, message counter)'
                }],
                ['levelup_notif', {
                    script: 'changeNotif.js',
                    help: "Change the way Felix notify users when they level up, either `dm`, `channel` or `disabled` (dm stands for direct message)",
                    args: 1
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(message.channel.createMessage(`Heads up ! Since the update \`3.0.0\` this command uses the website for significantly improved ease-to-use, but you can still use the shortcuts if you don't want to use the website ^`))
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Experience();