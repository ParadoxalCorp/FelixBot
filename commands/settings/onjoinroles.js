'use strict';

const Command = require('../../util/helpers/modules/Command');

class OnJoinRoles extends Command {
    constructor() {
        super();
        this.extra = {
            possibleActions: [{
                name: 'add_role',
                func: this.addRole.bind(this),
                interpretAs: '{value}',
                expectedArgs: 1
            }, {
                name: 'remove_role',
                func: this.removeRole.bind(this),
                interpretAs: '{value}',
                expectedArgs: 1
            }, {
                name: 'list_roles',
                func: this.listRoles.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }]
        };
        this.help = {
            name: 'onjoinroles',
            category: 'settings',
            description: 'This command allows you to set roles to give to each new member, each roles added will be given to the new members of the server right when they join',
            usage: '{prefix}onjoinroles'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['defaultroles'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [{
                description: 'Please specify the action you want to do in the following possible actions: ' + this.extra.possibleActions.map(a => `\`${a.name}\``).join(', '),
                possibleValues: this.extra.possibleActions
            }, {
                //Conditional add_role branch
                condition: (client, message, args) => args.includes('add_role'),
                description: 'Please specify the name of the role to add'
            }, {
                //Conditional remove_role branch
                condition: (client, message, args) => args.includes('remove_role'),
                description: 'Please specify the name of the role set to be given to new members to remove'
            }]
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        const action = this.extra.possibleActions.find(a => a.name === args[0]);
        const getPrefix = client.commands.get('help').getPrefix;
        if (!action) {
            return message.channel.createMessage(`:x: The specified action is invalid, if you are lost, simply run the command like \`${getPrefix(client, guildEntry)}${this.help.name}\``);
        }
        //If the command isn't ran without args and the args aren't what's expected, to not conflict with the skipping in conditions 
        if (message.content.split(/\s+/g).length !== 2 && (action.expectedArgs > args.length - 1)) {
            return message.channel.createMessage(`:x: This action expect \`${action.expectedArgs - (args.length - 1)}\` more argument(s), if you are lost, simply run the command like \`${getPrefix(client, guildEntry)}${this.help.name}\``);
        }
        return action.func(client, message, args, guildEntry, userEntry);
    }

    async addRole(client, message, args, guildEntry) {
        const roleName = args.splice(1).join(' ');
        const role = await this.getRoleFromText({ message: message, client: client, text: roleName });
        const alreadySet = role ? guildEntry.onJoinRoles.includes(role.id) : false;
        guildEntry.onJoinRoles = guildEntry.onJoinRoles.filter(r => message.channel.guild.roles.has(r));
        if (!role) {
            return message.channel.createMessage(`:x: I couldn't find the role \`${roleName}\` in this server`);
        } else if (alreadySet) {
            return message.channel.createMessage(`:x: The role \`${role.name}\` is already set to be given to new members`);
        } else if (guildEntry.onJoinRoles.length >= client.config.options.maxDefaultRoles) {
            return message.channel.createMessage(`:x: There is already \`${guildEntry.onJoinRoles.length}\` roles set to be given to new members, you can't add any more than that`);
        } 
        guildEntry.onJoinRoles.push(role.id);
        await client.database.set(guildEntry, 'guild');
        let warning = '';
        const hasPerm = Array.isArray(this.clientHasPermissions(message, client, ['manageRoles'])) ? false : true;
        if (!hasPerm || role.position > this.getHighestRole(client.bot.user.id, message.channel.guild).position) {
            warning += ':warning: ';
            warning += !hasPerm ? 'I lack the `Manage Roles` permission' : '';
            warning += (!hasPerm ? ' and ' : '') + 'this role is higher than my highest role';
            warning += '. I therefore won\'t be able to give it when the time comes, you should fix that as soon as possible or remove the role';
        }
        return message.channel.createMessage(`:white_check_mark: Successfully set the role \`${role.name}\` to be given to new members` + (warning ? `\n\n${warning}` : ''));
    }

    async removeRole(client, message, args, guildEntry) {
        const roleName = args.splice(1).join(' ');
        const role = await this.getRoleFromText({ message: message, client: client, text: roleName });
        guildEntry.onJoinRoles = guildEntry.onJoinRoles.filter(r => message.channel.guild.roles.has(r));
        const isSet = role ? guildEntry.onJoinRoles.includes(role.id) : false;
        if (!role) {
            return message.channel.createMessage(`:x: I couldn't find the role \`${roleName}\` in this server`);
        } else if (!isSet) {
            return message.channel.createMessage(`:x: This role isn't set to be given to new members, therefore, i can't remove it`);
        }
        guildEntry.onJoinRoles.splice(guildEntry.onJoinRoles.findIndex(r => r === role.id), 1);
        await client.database.set(guildEntry, 'guild');
        return message.channel.createMessage(`:white_check_mark: Successfully removed the role \`${role.name}\``);
    }

    async listRoles(client, message, args, guildEntry) {
        guildEntry.onJoinRoles = guildEntry.onJoinRoles.filter(r => message.channel.guild.roles.has(r));
        if (!guildEntry.onJoinRoles[0]) {
            return message.channel.createMessage(':x: There is no role(s) set to be given to new members');
        }
        return client.interactiveList.createPaginatedMessage({
            channel: message.channel,
            userID: message.author.id,
            messages: guildEntry.onJoinRoles.map(r => {
                const guildRole = message.channel.guild.roles.get(r);
                return {
                    embed: {
                        title: 'On join roles list',
                        fields: [{
                            name: 'Name',
                            value: guildRole.name,
                            inline: true
                        }, {
                            name: 'Color',
                            value: `#${this.getHexColor(guildRole.color)} (The borders colors of this list are a preview`
                        }],
                        footer: {
                            text: `Showing page {index}/${guildEntry.onJoinRoles.length}`
                        },
                        color: guildRole.color ? guildRole.color : undefined
                    }
                };
            })
        });
    }

    _checkPermissions(client, message, guildEntry) {
        let result = '';
        const channel = message.channel.guild.channels.get(guildEntry.experience.notifications.channel);
        if (channel) {
            result += Array.isArray(this.clientHasPermissions(message, client, ['sendMessages'], channel)) ? `:warning: I don't have enough permissions to send messages in <#${channel.id}>\n` : '';
        }
        if (Array.isArray(this.clientHasPermissions(message, client, ['manageRoles'])) && guildEntry.experience.roles[0]) {
            result += ':warning: I don\'t have the `Manage Roles` permission and there are roles set to be given\n';
        }
        guildEntry.experience.roles = guildEntry.experience.roles.filter(r => message.channel.guild.roles.has(r.id));
        const higherRoles = guildEntry.experience.roles.filter(r => message.channel.guild.roles.get(r.id).position > this.getHighestRole(client.bot.user.id, message.channel.guild).position);
        if (higherRoles[0]) {
            result += ':warning: The role(s) ' + higherRoles.map(r => `\`${message.channel.guild.roles.get(r.id).name}\``).join(', ') + ' is/are set to be given at some point, however it is/they are higher than my highest role and i therefore can\'t give them';
        }
        if (!result) {
            result = ':white_check_mark: No permissions issues have been detected with the current settings';
        }
        return result;
    }
}

module.exports = new OnJoinRoles();