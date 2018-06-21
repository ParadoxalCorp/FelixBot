'use strict';

const Command = require('../../util/helpers/modules/Command');

class RemovePermission extends Command {
    constructor() {
        super();
        this.help = {
            name: 'removepermission',
            category: 'moderation',
            description: '**Remove** (not restrict) a set command/category permission from the server, or from a channel/role/user. As always, you can run the command like `{prefix}removepermission` to be guided through the process',
            usage: '{prefix}removepermission <command_name|category_name*> | <global|channel|role|user> | <channel_name|role_name|username>',
            externalDoc: 'https://github.com/ParadoxalCorp/FelixBot/blob/master/usage.md#permissions-system'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['removeperm', 'rp'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [{
                description: 'What permission do you want to remove, you can reply with a command name like `ping` to target this command, or the name of a command category followed by a `*` like `generic*` to target a whole category',
                validate: (client, message, arg) => this.validatePermission(client, arg)
            }, {
                description: 'From what this permission should be removed? You can reply with `global` to target the entire server, `channel` to target a specific channel, `role` to target a specific role or `user` to target a specific user',
                validate: (client, message, arg) => this.validateTarget(arg)
            }, {
                description: `Please reply with the name of the target (channel/role/user) you want to remove this permission from`,
                condition: (client, message, args) => args[1].toLowerCase() !== 'global'
            }]
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        const getPrefix = client.commands.get('help').getPrefix;
        if (!this.validatePermission(client, args[0])) {
            return message.channel.createMessage(':x: The permission must be a command name, like `ping`, or the name of a command category followed by a `*` like `generic*` to target a whole category. If you are lost, simply run this command like `' + getPrefix(client, guildEntry) + this.help.name + '`');
        } else if (!this.validateTarget(args[1])) {
            return message.channel.createMessage(':x: You must specify from what this permission should be removed with either `global`, `channel`, `role` or `user`. If you are lost, simply run this command like `' + getPrefix(client, guildEntry) + this.help.name + '`');
        }
        let target = args[1].toLowerCase() === 'global' ? 'global' : null;
        if (args[1].toLowerCase() === 'channel') {
            target = await this.getChannelFromText({client, message, text: args.slice(2).join(' ')});
        } else if (args[1].toLowerCase() === 'role') {
            target = await this.getRoleFromText({client, message, text: args.slice(2).join(' ')});
        } else if (args[1].toLowerCase() === 'user') {
            target = await this.getUserFromText({client, message, text: args.slice(2).join(' ')});
        }
        if (!target) {
            return message.channel.createMessage(`:x: I couldn't find this ${args[1].toLowerCase()}`);
        }
        let permission = client.aliases.has(args[0].toLowerCase()) ? client.aliases.get(args[0].toLowerCase()) : args[0].toLowerCase();
        return this.removePermission(client, message, guildEntry, {permission, targetType: args[1].toLowerCase(), target});
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
        return !command && !categories.includes(arg) ? false : true;
    }

    validateTarget(arg) {
        return arg ? ['global', 'channel', 'role', 'user'].includes(arg.toLowerCase()) : false;
    }

    async removePermission(client, message, guildEntry, args) {
        let targetPerms = guildEntry.permissions[args.targetType === 'global' ? 'global' : `${args.targetType}s`];
        if (Array.isArray(targetPerms)) {
            targetPerms = targetPerms.find(perms => perms.id === args.target.id);
        }
        if (!targetPerms || (!targetPerms.allowedCommands.includes(args.permission) && !targetPerms.restrictedCommands.includes(args.permission))) {
            return message.channel.createMessage(`:x: The permission \`${args.permission}\` is neither restricted nor allowed on this ${args.targetType === 'global' ? 'server' : args.targetType}`);
        }
        let restricted;
        if (targetPerms.allowedCommands.includes(args.permission)) {
            targetPerms.allowedCommands.splice(targetPerms.allowedCommands.findIndex(perm => perm === args.permission), 1);
        } else {
            targetPerms.restrictedCommands.splice(targetPerms.allowedCommands.findIndex(perm => perm === args.permission), 1);
            restricted = true;
        }
        //Delete the permission group if empty
        if (args.targetType !== 'global' && !targetPerms.allowedCommands[0] && !targetPerms.restrictedCommands[0]) {
            guildEntry.permissions[`${args.targetType}s`].splice(guildEntry.permissions[`${args.targetType}s`].findIndex(perms => perms.id === args.target.id));
        }
        await client.database.set(guildEntry, 'guild');
        return message.channel.createMessage(`:white_check_mark: Successfully removed the permission \`${args.permission}\` which was ${restricted ? 'restricted' : 'allowed'} on the ${args.targetType === 'global' ? 'server' : args.targetType} ${args.target.name || args.target.username ? ('**' + (args.target.name || client.extendedUser(args.target).tag) + '**') : ''}`);
    }
}

module.exports = new RemovePermission();