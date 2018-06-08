'use strict';

const Command = require('../../util/helpers/modules/Command');

class Iam extends Command {
    constructor() {
        super();
        this.help = {
            name: 'iam',
            category: 'misc',
            description: 'Assign to yourself a self-assignable role, you can see the list of self-assignable roles set on this server with `{prefix}iam`',
            usage: '{prefix}iam <role_name>'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: ['manageRoles'],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        guildEntry.selfAssignableRoles = guildEntry.selfAssignableRoles.filter(r => message.channel.guild.roles.has(r)); //Filter deleted roles
        if (!args[0]) {
            return this.createList(client, message, guildEntry);
        } else {
            return this.assignRole(client, message, args, guildEntry);
        }
    }

    createList(client, message, guildEntry) {
        if (!guildEntry.selfAssignableRoles[0]) {
            return message.channel.createMessage(":x: There is no self-assignable role set on this server");
        }
        return client.interactiveList.createPaginatedMessage({
            channel: message.channel,
            userID: message.author.id,
            messages: (() => {
                let messages = [];
                for (const role of guildEntry.selfAssignableRoles) {
                    const guildRole = message.channel.guild.roles.get(role);
                    messages.push({
                        embed: {
                            title: "Self-assignable roles list",
                            description: "Here's the list of the self-assignable role, you can assign one to yourself with `" + guildEntry.getPrefix + " iam <role_name>`\n",
                            footer: {
                                text: `Showing page {index}/${guildEntry.selfAssignableRoles.length} | Time limit: 60 seconds`
                            },
                            fields: [{
                                name: 'Name',
                                value: `${guildRole.name}`,
                                inline: true
                            }, {
                                name: 'HEX Color',
                                value: `#${this.getHexColor(guildRole.color)} (the borders color of this list are a preview)`,
                                inline: true
                            }, {
                                name: `Hoisted`,
                                value: guildRole.hoist ? `:white_check_mark:` : `:x:`
                            }, {
                                name: 'Mentionable',
                                value: guildRole.mentionable ? `:white_check_mark:` : `:x:`,
                                inline: true
                            }],
                            color: guildRole.color
                        }
                    });
                }
                return messages;
            })()
        });
    }

    async assignRole(client, message, args, guildEntry) {
        let guildRole = await this.getRoleFromText({
            message: message,
            client: client,
            text: args.join(' ')
        });
        const member = message.channel.guild.members.get(message.author.id);
        if (!guildRole || !guildEntry.selfAssignableRoles.includes(guildRole.id)) {
            return message.channel.createMessage(":x: The specified role does not exist or it is not a self-assignable role");
        }
        if (member.roles.find(r => r === guildRole.id)) {
            return message.channel.createMessage(':x: You already have this role');
        }
        await member.addRole(guildRole.id);
        return message.channel.createMessage(":white_check_mark: Alright, i gave you the role `" + guildRole.name + "`");
    }
}

module.exports = new Iam();