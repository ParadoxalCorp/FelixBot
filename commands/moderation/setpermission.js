'use strict';

const Command = require('../../util/helpers/modules/Command');

class SetPermission extends Command {
    constructor() {
        super();
        this.help = {
            name: 'setpermission',
            category: 'moderation',
            description: 'Set a new command/category permission for the server, or a channel/role/user. As always, you can run the command like `{prefix}setpermission` to be guided through the process',
            usage: '{prefix}setpermission <command_name|category_name*> | <true|false> | <global|channel|role|user> | <channel_name|role_name|username>',
            externalDoc: 'https://github.com/ParadoxalCorp/FelixBot/blob/master/usage.md#permissions-system'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['setperm', 'sp'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [{
                description: 'What permission do you want to set, you can reply with a command name like `ping` to target this command, or the name of a command category followed by a `*` like `generic*` to target a whole category',
                validate: (client, message, arg) => this.validatePermission(client, arg)
            }, {
                description: 'Do you want to restrict or allow this permission, reply with `true` to allow it and `false` to restrict it',
                possibleValues: [{
                    name: 'true',
                    interpretAs: 'true'
                }, {
                    name: 'false',
                    interpretAs: 'false'
                }]
            }, {
                description: 'To what this permission should apply to, you can reply with `global` to target the entire server, `channel` to target a specific channel, `role` to target a specific role or `user` to target a specific user',
                validate: (client, message, arg) => this.validateTarget(arg)
            }, {
                description: `Please reply with the name of the target (channel/role/user) you want to apply this permission on`,
                condition: (client, message, args) => args[2].toLowerCase() !== 'global'
            }]
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        const getPrefix = client.commands.get('help').getPrefix;
        if (!this.validatePermission(client, args[0])) {
            return message.channel.createMessage(':x: The permission must be a command name, like `ping`, or the name of a command category followed by a `*` like `generic*` to target a whole category. If you are lost, simply run this command like `' + getPrefix(client, guildEntry) + this.help.name + '`');
        } else if (!['true', 'false'].includes(args[1].toLowerCase())) {
            return message.channel.createMessage(':x: You must specify whether to restrict or allow this permission with `true` or `false`. If you are lost, simply run this command like `' + getPrefix(client, guildEntry) + this.help.name + '`');
        } else if (!this.validateTarget(args[2])) {
            return message.channel.createMessage(':x: You must specify to what this permission should apply to with either `global`, `channel`, `role` or `user`. If you are lost, simply run this command like `' + getPrefix(client, guildEntry) + this.help.name + '`');
        }
        let target = args[2].toLowerCase() === 'global' ? 'global' : null;
        if (args[2].toLowerCase() === 'channel') {
            target = await this.getChannelFromText({client, message, text: args.slice(3).join(' '), textual: true});
        } else if (args[2].toLowerCase() === 'role') {
            target = await this.getRoleFromText({client, message, text: args.slice(3).join(' ')});
        } else if (args[2].toLowerCase() === 'user') {
            target = await this.getUserFromText({client, message, text: args.slice(3).join(' ')});
        }
        if (!target) {
            return message.channel.createMessage(`:x: I couldn't find this ${args[2].toLowerCase()}`);
        }
        let permission = client.aliases.has(args[0].toLowerCase()) ? client.aliases.get(args[0].toLowerCase()) : args[0].toLowerCase();
        return this.setPermission(client, message, guildEntry, {permission, override: args[1].toLowerCase() === 'true' ? true : false, targetType: args[2].toLowerCase(), target});
    }

    validatePermission(client, arg) {
        let categories = [];
        arg = arg ? arg.toLowerCase() : '';
        //eslint-disable-next-line no-unused-vars
        for (const [key, command] of client.commands) {
            if (!categories.includes(command.help.category) && command.help.category !== 'admin') {
                categories.push(`${command.help.category}*`);
            } 
        }
        let command = client.commands.get(arg) || client.commands.get(client.aliases.get(arg));
        if (command && command.help.category === 'admin') {
            return false;
        }
        return !client.commands.has(arg) && !client.aliases.has(arg) && !categories.includes(arg) ? false : true;
    }

    validateTarget(arg) {
        return arg ? ['global', 'channel', 'role', 'user'].includes(arg.toLowerCase()) : false;
    }

    async setPermission(client, message, guildEntry, args) {
        let targetPerms = guildEntry.permissions[args.targetType === 'global' ? 'global' : `${args.targetType}s`];
        if (Array.isArray(targetPerms)) {
            if (!targetPerms.find(perms => perms.id === args.target.id)) {
                targetPerms.push(client.refs.permissionsSet(args.target.id));
            }
            targetPerms = targetPerms.find(perms => perms.id === args.target.id);
        }
        if (targetPerms[args.override ? 'allowedCommands' : 'restrictedCommands'].includes(args.permission)) {
            return message.channel.createMessage(`:x: The permission \`${args.permission}\` is already ${args.override ? 'allowed' : 'restricted'} for this ${args.targetType === 'global' ? 'server' : args.targetType}`);
        }
        //If the permissions is already set to true/false; tl;dr the opposite, remove it, as the user obviously don't want to keep it
        let oppositePerm = targetPerms[args.override ? 'restrictedCommands' : 'allowedCommands'];
        if (oppositePerm.includes(args.permission)) {
            oppositePerm.splice(oppositePerm.findIndex(perm => perm === args.permission), 1);
        }
        targetPerms[args.override ? 'allowedCommands' : 'restrictedCommands'].push(args.permission);
        await client.database.set(guildEntry, 'guild');
        return message.channel.createMessage(`:white_check_mark: Successfully ${args.override ? 'allowed' : 'restricted'} the permission \`${args.permission}\` for the ${args.targetType === 'global' ? 'server' : args.targetType} ${args.target.name || args.target.username ? ('**' + (args.target.name || client.extendedUser(args.target).tag) + '**') : ''}`);
    }
}

module.exports = new SetPermission();