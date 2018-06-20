'use strict';

const Command = require('../../util/helpers/modules/Command');

class Experience extends Command {
    constructor() {
        super();
        this.extra = {
            possibleActions: [{
                name: 'add',
                func: this.add.bind(this),
                interpretAs: '{value}',
                expectedArgs: 1
            }, {
                name: 'remove',
                func: this.remove.bind(this),
                interpretAs: '{value}',
                expectedArgs: 1
            }, {
                name: 'list',
                func: this.listRoles.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }]
        };
        this.help = {
            name: 'sar',
            category: 'settings',
            description: 'This command allows you to manage self-assignable roles on this server',
            usage: '{prefix}sar'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['activity'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [{
                description: 'Please specify the action you want to do in the following possible actions: ' + this.extra.possibleActions.map(a => `\`${a.name}\``).join(', '),
                possibleValues: this.extra.possibleActions
            }, {
                //Conditional add branch
                condition: (client, message, args) => args.includes('add'),
                description: 'Please specify the name of the role to make self-assignable'
            }, {
                //Conditional remove branch
                condition: (client, message, args) => args.includes('remove'),
                description: 'Please specify the name of the self-assignable role to remove'
            }]
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        const action = this.extra.possibleActions.find(a => a.name === args[0]);
        if (!action) {
            return message.channel.createMessage(`:x: The specified action is invalid, if you are lost, simply run the command like \`${guildEntry.getPrefix} ${this.help.name}\``);
        }
        if (action.expectedArgs > args.length - 1) {
            return message.channel.createMessage(`:x: This action expect \`${action.expectedArgs - (args.length - 1)}\` more argument(s), if you are lost, simply run the command like \`${guildEntry.getPrefix} ${this.help.name}\``);
        }
        guildEntry.selfAssignableRoles = guildEntry.selfAssignableRoles.filter(r => message.channel.guild.roles.has(r));
        return action.func(client, message, args, guildEntry, userEntry);
    }

    async add(client, message, args, guildEntry) {
        const role = typeof args[1] === 'string' ? await this.getRoleFromText({ message: message, client: client, text: args[1] }) : args[1];
        const alreadySet = role ? guildEntry.selfAssignableRoles.includes(role.id) : false;
        if (!role) {
            return message.channel.createMessage(`:x: I couldn't find the role \`${args[1]}\` in this server`);
        } else if (alreadySet) {
            return message.channel.createMessage(`:x: The role \`${role.name}\` is already set as a self-assignable role`);
        }
        guildEntry.selfAssignableRoles.push(role.id);
        await client.database.set(guildEntry, 'guild');
        const warning = this._checkPermissions(client, message, guildEntry);
        return message.channel.createMessage(`:white_check_mark: Successfully set the role \`${role.name}\` as a self-assignable role ${warning !== true ? ('\n\n' + warning) : ''}`);
    }

    async remove(client, message, args, guildEntry) {
        const role = await this.getRoleFromText({ message: message, client: client, text: args[1] });
        const isSet = role ? guildEntry.selfAssignableRoles.includes(role.id) : false;
        if (!role) {
            return message.channel.createMessage(`:x: I couldn't find the role \`${args[1]}\` in this server`);
        } else if (!isSet) {
            return message.channel.createMessage(`:x: This role isn't set as self-assignable`);
        }
        guildEntry.selfAssignableRoles.splice(guildEntry.selfAssignableRoles.findIndex(r => r === role.id), 1);
        await client.database.set(guildEntry, 'guild');
        return message.channel.createMessage(`:white_check_mark: Successfully removed the role \`${role.name}\``);
    }

    async listRoles(client, message, args, guildEntry) {
        guildEntry.selfAssignableRoles = guildEntry.selfAssignableRoles.filter(r => message.channel.guild.roles.has(r));
        if (!guildEntry.selfAssignableRoles[0]) {
            return message.channel.createMessage(':x: There is no role(s) set to be given at any level');
        }
        return client.interactiveList.createPaginatedMessage({
            channel: message.channel,
            userID: message.author.id,
            messages: guildEntry.selfAssignableRoles.map(r => {
                const guildRole = message.channel.guild.roles.get(r);
                return {
                    embed: {
                        title: 'Activity roles list',
                        fields: [{
                            name: 'Name',
                            value: guildRole.name,
                            inline: true
                        }, {
                            name: 'Mentionable',
                            value: guildRole.mentionable ? ':white_check_mark:' : ':x:',
                            inline: true
                        }, {
                            name: 'Hoisted',
                            value: guildRole.hoist ? ':white_check_mark:' : ':x:'
                        }, {
                            name: 'Color',
                            value: `#${this.getHexColor(guildRole.color)} (the borders color of this list are a preview)`,
                            inline: true
                        }],
                        footer: {
                            text: `Showing page {index}/${guildEntry.selfAssignableRoles.length}`
                        },
                        color: guildRole.color
                    }
                };
            })
        });
    }

    _checkPermissions(client, message, guildEntry) {
        let result = '';
        if (Array.isArray(this.clientHasPermissions(message, client, ['manageRoles'])) && guildEntry.selfAssignableRoles[0]) {
            result += ':warning: I don\'t have the `Manage Roles` permission, i therefore won\'t be able to give this role when the time come\n';
        }
        const higherRoles = guildEntry.selfAssignableRoles.filter(r => message.channel.guild.roles.get(r).position > this.getHighestRole(client.bot.user.id, message.channel.guild).position);
        if (higherRoles[0]) {
            result += ':warning: The role(s) ' + higherRoles.map(r => `\`${message.channel.guild.roles.get(r).name}\``).join(', ') + ' is/are set as self-assignable, however it is/they are higher than my highest role and i therefore can\'t give them';
        }
        return result ? result : true;
    }
}

module.exports = new Experience();