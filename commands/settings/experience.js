'use strict';

const Command = require('../../util/helpers/modules/Command');

class Experience extends Command {
    constructor() {
        super();
        this.extra = {
            possibleActions: [{
                name: 'enable',
                func: this.enable.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }, {
                name: 'disable',
                func: this.disable.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }, {
                name: 'add_role',
                func: this.addRole.bind(this),
                interpretAs: '{value}',
                expectedArgs: 3
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
            }, {
                name: 'enable_levelup_notifs',
                func: this.enableLevelUpNotifs.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }, {
                name: 'disable_levelup_notifs',
                func: this.disableLevelUpNotifs.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }, {
                name: 'set_levelup_notifs_target',
                func: this.setLevelUpNotifsTarget.bind(this),
                interpretAs: '{value}',
                expectedArgs: 1
            }, {
                name: 'set_levelup_notifs_message',
                func: this.setLevelUpNotifsMessage.bind(this),
                interpretAs: '{value}',
                expectedArgs: 1
            }, {
                name: 'see_settings',
                func: this.seeSettings.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }]
        };
        this.help = {
            name: 'experience',
            category: 'settings',
            description: 'This command allows you to change the settings of the activity system (enable it, add roles to be given at a specific level and such), the full syntax is like `{prefix}experience add_role <role> <level> <static|no>`',
            usage: '{prefix}experience',
            externalDoc: 'https://github.com/ParadoxalCorp/FelixBot/blob/master/usage.md#activity-system'
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
                //Conditional add_role branch
                condition: (client, message, args) => args.includes('add_role'),
                description: 'Please specify the name of the role to add'
            }, {
                //Skip if the given role name is invalid
                condition: async(client, message, args) => {
                    if (!args.includes('add_role')) {
                        return false;
                    }
                    const role = await this.getRoleFromText({ message: message, client: client, text: args[1] });
                    //Overwrite argument so the command handler will pass the resolved role to the command
                    //That not only avoid a slower duplicate check, but also a duplicate query if multiple roles have first been resolved
                    if (role) {
                        args[1] = role;
                    }
                    return role;
                },
                description: 'Please specify at which level this role should be given (specify a number)'
            }, {
                //Skip if the given role name is invalid or if the specified level isn't a whole number
                condition: (client, message, args) => {
                    if (!args.includes('add_role') || !args[2] || !client.isWholeNumber(args[2])) {
                        return false;
                    }
                    return true;
                },
                description: `Please specify whether this role should be static, if not, the role will be removed from members who won it whenever they win another role at a higher level (check <${this.help.externalDoc}> for more information). Possible answers are \`yes\` or \`no\``,
                possibleValues: [{
                    name: 'yes',
                    interpretAs: 'static'
                }, {
                    name: 'no',
                    interpretAs: false
                }]
            }, {
                //Conditional remove_role branch
                condition: (client, message, args) => args.includes('remove_role'),
                description: 'Please specify the name of the role set to be given at a certain level to remove'
            }, {
                //Conditional set_levelup_notifs_target branch
                condition: (client, message, args) => args.includes('set_levelup_notifs_target'),
                description: 'Please specify the target of the level up notifications, specify `#<channel_name>` or `<channel_name>` to send them in a specific channel, `this` to send them in the channel where the member sent their last message, or `dm` to send them directly to the member who just levelled up in their DMs',
                possibleValues: [{
                    name: '*',
                    interpretAs: '{value}'
                }]
            }, {
                //Conditional set_levelup_notifs_message branch
                condition: (client, message, args) => args.includes('set_levelup_notifs_message'),
                description: `Please specify the level up message you want to be sent whenever a member level up, check <${this.help.externalDoc}> for more information and a list of tags you can use`
            }]
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        const action = this.extra.possibleActions.find(a => a.name === args[0]);
        const getPrefix = client.commands.get('help').getPrefix;
        if (!action) {
            return message.channel.createMessage(`:x: The specified action is invalid, if you are lost, simply run the command like \`${getPrefix(client, guildEntry)}experience\``);
        }
        //If the command isn't ran without args and the args aren't what's expected, to not conflict with the skipping in conditions 
        if (message.content.split(/\s+/g).length !== 2 && (action.expectedArgs > args.length - 1)) {
            return message.channel.createMessage(`:x: This action expect \`${action.expectedArgs - (args.length - 1)}\` more argument(s), if you are lost, simply run the command like \`${getPrefix(client, guildEntry)}experience\``);
        }
        return action.func(client, message, args, guildEntry, userEntry);
    }

    async enable(client, message, args, guildEntry) {
        if (!guildEntry.experience.enabled) {
            guildEntry.experience.enabled = true;
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(':white_check_mark: Alright, the activity system is now enabled, members will gain experience as they speak');
        } else {
            return message.channel.createMessage(':x: The activity system is already enabled');
        }
    }

    async disable(client, message, args, guildEntry) {
        if (guildEntry.experience.enabled) {
            guildEntry.experience.enabled = false;
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(':white_check_mark: Alright, the activity system is now disabled');
        } else {
            return message.channel.createMessage(':x: The activity system is already disabled');
        }
    }

    async addRole(client, message, args, guildEntry) {
        const role = typeof args[1] === 'string' ? await this.getRoleFromText({ message: message, client: client, text: args[1] }) : args[1];
        const alreadySet = role ? guildEntry.experience.roles.find(r => r.id === role.id) : false;
        if (!role) {
            return message.channel.createMessage(`:x: I couldn't find the role \`${args[1]}\` in this server`);
        } else if (!client.isWholeNumber(args[2])) {
            return message.channel.createMessage(':x: The level must be a whole number');
        } else if (alreadySet) {
            return message.channel.createMessage(`:x: The role \`${role.name}\` is already set to be given at the level \`${alreadySet.at}\`. Please remove it first before adding it back`);
        } else if (guildEntry.experience.roles.filter(r => r.at === parseInt(args[2])).length >= client.config.options.experience.maxRolesPerLevel) {
            return message.channel.createMessage(`:x: There is already \`${guildEntry.experience.roles.length}\` roles set to be given at the level \`${args[2]}\`, you can't add any more than that`);
        } else if (parseInt(args[2]) > client.config.options.experience.maxRolesLevel) {
            return message.channel.createMessage(`:x: \`${client.config.options.experience.maxRolesLevel}\` is the maximum level at which you can assign roles, as it isn't realistically possible to reach it`);
        }
        guildEntry.experience.roles.push(client.refs.activityGuildRole(role.id, parseInt(args[2]), args.includes('static')));
        await client.database.set(guildEntry, 'guild');
        let warning = '';
        const hasPerm = Array.isArray(this.clientHasPermissions(message, client, ['manageRoles'])) ? false : true;
        if (!hasPerm || role.position > this.getHighestRole(client.bot.user.id, message.channel.guild).position) {
            warning += ':warning: ';
            warning += !hasPerm ? 'I lack the `Manage Roles` permission' : '';
            warning += (!hasPerm ? ' and ' : '') + 'this role is higher than my highest role';
            warning += '. I therefore won\'t be able to give it when the time comes, you should fix that as soon as possible or remove the role';
        }
        return message.channel.createMessage(`:white_check_mark: Successfully set the role \`${role.name}\` as a ${args.includes('static') ? 'static' : 'removable'} role to be given at the level \`${args[2]}\`` + (warning ? `\n\n${warning}` : ''));
    }

    async removeRole(client, message, args, guildEntry) {
        const role = await this.getRoleFromText({ message: message, client: client, text: args[1] });
        const isSet = role ? guildEntry.experience.roles.find(r => r.id === role.id) : false;
        if (!role) {
            return message.channel.createMessage(`:x: I couldn't find the role \`${args[1]}\` in this server`);
        } else if (!isSet) {
            return message.channel.createMessage(`:x: This role isn't set to be given at any level, therefore, i can't remove it`);
        }
        guildEntry.removeActivityRole(role.id);
        await client.database.set(guildEntry, 'guild');
        return message.channel.createMessage(`:white_check_mark: Successfully removed the role \`${role.name}\` which was set to be given at the level \`${isSet.at}\``);
    }

    async listRoles(client, message, args, guildEntry) {
        guildEntry.experience.roles = guildEntry.experience.roles.filter(r => message.channel.guild.roles.has(r.id));
        if (!guildEntry.experience.roles[0]) {
            return message.channel.createMessage(':x: There is no role(s) set to be given at any level');
        }
        return client.interactiveList.createPaginatedMessage({
            channel: message.channel,
            userID: message.author.id,
            messages: guildEntry.experience.roles.map(r => {
                const guildRole = message.channel.guild.roles.get(r.id);
                return {
                    embed: {
                        title: 'Activity roles list',
                        fields: [{
                            name: 'Name',
                            value: guildRole.name,
                            inline: true
                        }, {
                            name: 'At level',
                            value: r.at,
                            inline: true
                        }, {
                            name: 'Static',
                            value: r.static ? ':white_check_mark:' : ':x:'
                        }, {
                            name: 'Color',
                            value: `#${this.getHexColor(guildRole.color)} (The borders colors of this list are a preview`
                        }],
                        footer: {
                            text: `Showing page {index}/${guildEntry.experience.roles.length}`
                        },
                        color: guildRole.color
                    }
                };
            })
        });
    }

    async enableLevelUpNotifs(client, message, args, guildEntry) {
        if (!guildEntry.experience.notifications.enabled) {
            guildEntry.experience.notifications.enabled = true;
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(':white_check_mark: Alright, the level up notifications are now enabled');
        } else {
            return message.channel.createMessage(':x: The level up notifications are already enabled');
        }
    }

    async disableLevelUpNotifs(client, message, args, guildEntry) {
        if (guildEntry.experience.notifications.enabled) {
            guildEntry.experience.notifications.enabled = false;
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(':white_check_mark: Alright, the level up notifications are now disabled');
        } else {
            return message.channel.createMessage(':x: The level up notifications are already disabled');
        }
    }

    async setLevelUpNotifsTarget(client, message, args, guildEntry) {
        if (args[1].toLowerCase() === 'dm' || args[1].toLowerCase() === 'this') {
            if (guildEntry.experience.notifications.channel === args[1].toLowerCase()) {
                return message.channel.createMessage(`:x: The level up notifications target is already set to \`${args[1].toLowerCase()}\``);
            }
            guildEntry.experience.notifications.channel = args[1].toLowerCase();
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(`:white_check_mark: Alright, the level up notifications target has been updated`);
        }
        const channel = await this.getChannelFromText({ client: client, message: message, text: args[1] });
        if (!channel) {
            return message.channel.createMessage(`:x: I couldn't find a channel named \`${args[1]}\` on this server`);
        } else if (guildEntry.experience.notifications.channel === channel.id) {
            return message.channel.createMessage(`:x: The level up notifications target is already set to the channel <#${channel.id}>`);
        }
        guildEntry.experience.notifications.channel = channel.id;
        await client.database.set(guildEntry, 'guild');
        const hasPerm = Array.isArray(this.clientHasPermissions(message, client, ['sendMessages'], channel)) ? false : true;
        return message.channel.createMessage(`:white_check_mark: Alright, the level up notifications target has been set to the channel <#${channel.id}>` + (!hasPerm ? `\n\n:warning: It seems like i don\'t have enough permissions to send messages in <#${channel.id}>, you may want to fix that` : ''));
    }

    async setLevelUpNotifsMessage(client, message, args, guildEntry) {
        if (!args[1]) {
            return message.channel.createMessage(':x: You must specify the new level up message to use');
        }
        guildEntry.experience.notifications.message = args[2] ? args.join(' ') : args[1];
        await client.database.set(guildEntry, 'guild');
        return message.channel.createMessage(':white_check_mark: Alright, the level up message has been updated');
    }

    async seeSettings(client, message, args, guildEntry) {
        const levelUpMessage = guildEntry.experience.notifications.message || client.config.options.experience.defaultLevelUpMessage;
        return message.channel.createMessage({
            embed: {
                title: ':gear: Current activity system settings',
                description: 'Level up message: ```\n' + (levelUpMessage.length > 1950 ? levelUpMessage.substr(0, 1950) + '...' : levelUpMessage) + '```',
                fields: [{
                    name: 'Activity system',
                    value: guildEntry.experience.enabled ? 'Enabled :white_check_mark:' : 'Disabled :x:',
                    inline: true
                }, {
                    name: 'Level up notifications',
                    value: guildEntry.experience.notifications.enabled ? 'Enabled :white_check_mark:' : 'Disabled :x:',
                    inline: true
                }, {
                    name: 'Roles',
                    value: `There are \`${guildEntry.experience.roles.length}\` role(s) set to be given at specific levels, you can see them by using \`${guildEntry.getPrefix} experience list_roles\``
                }, {
                    name: 'Level up target',
                    value: guildEntry.experience.notifications.channel ? (guildEntry.experience.notifications.channel === 'dm' ? 'dm' : `<#${guildEntry.experience.notifications.channel}>`) : 'this'
                }, {
                    name: 'Permissions',
                    value: this._checkPermissions(client, message, guildEntry)
                }],
                color: client.config.options.embedColor
            }
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

module.exports = new Experience();