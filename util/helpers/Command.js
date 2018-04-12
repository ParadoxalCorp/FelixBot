'use strict';

/**
 * Provide some utility methods to parse the args of a message, check the required permissions...
 * @class Command
 */
class Command {
    constructor() {}

    /**
     * Check if a message calls for a command
     * As it calls the database to check for a custom prefix, the method is asynchronous and may be awaited
     * @param {object} message - The message object to parse the command from
     * @param {object} client - The client instance
     * @returns {Promise<object>} - The command object, or undefined if the message is not prefixed or the command does not exist
     */
    parseCommand(message, client) {
        return new Promise(async(resolve, reject) => {
            const args = message.content.split(/\s+/);
            const guildEntry = message.channel.guild && client.database ?
                await client.database.getGuild(message.channel.guild.id).catch(err => {
                    return reject(err);
                }) :
                false;
            let prefixes = client.prefixes.map(p => p);
            if (guildEntry && guildEntry.prefix) {
                prefixes.push(guildEntry.prefix);
            }
            if (!prefixes.filter(p => p === args[0])[0]) {
                return resolve(undefined);
            }
            return resolve(client.commands.get(args[1]) || client.commands.get(client.aliases.get(args[1])));
        });
    }

    /**
     * Check if the bot has the given permissions to work properly
     * This is a deep check and the channels wide permissions will be checked too
     * @param {object} message - The message that triggered the command
     * @param {object} client  - The client instance
     * @param {array} permissions - An array of permissions to check for
     * @param {object} [channel=message.channel] - Optional, a specific channel to check perms for (to check if the bot can connect to a VC for example)
     * @returns {boolean | array} - An array of permissions the bot miss, or true if the bot has all the permissions needed, sendMessages permission is also returned if missing
     */
    clientHasPermissions(message, client, permissions, channel = message.channel) {
        const missingPerms = [];
        const clientMember = message.channel.guild.members.get(client.bot.user.id);

        function hasPerm(perm, Command) {
            if (clientMember.permission.has("administrator")) {
                return true;
            }
            if (!clientMember.permission.has(perm) && (!Command.hasChannelOverwrite(channel, clientMember, perm) ||
                    !Command.hasChannelOverwrite(channel, clientMember, perm).has(perm))) {
                return false;
            }
            return true;
        }

        permissions.forEach(perm => {
            if (!hasPerm(perm, this)) {
                missingPerms.push(perm);
            }
        });
        if (!hasPerm("sendMessages", this)) {
            missingPerms.push(perm);
        }
        return missingPerms[0] ? missingPerms : true;
    }

    /**
     * This method return the effective permission overwrite for a specific permission of a user
     * It takes into account the roles of the member, their position and the member itself to return the overwrite which actually is effective
     * @param {object} channel - The channel to check permissions overwrites in
     * @param {object} member - The member object to check permissions overwrites for
     * @param {string} permission - The permission to search channel overwrites for
     * @return {boolean | PermissionOverwrite} - The permission overwrite overwriting the specified permission, or false if none exist
     */
    hasChannelOverwrite(channel, member, permission) {
        const channelOverwrites = Array.from(channel.permissionOverwrites.values()).filter(co => typeof co.json[permission] !== "undefined" &&
            (co.id === member.id || member.roles.includes(co.id)));
        if (!channelOverwrites[0]) {
            return false;
        } else if (channelOverwrites.filter(co => co.type === "user")[0]) {
            return channelOverwrites.filter(co => co.type === "user")[0];
        }
        return channelOverwrites.sort((a, b) => channel.guild.roles.get(b.id).position - channel.guild.roles.get(a.id).position)[0];
    }

    /**
     * Try to resolve a user with IDs, names, partial usernames or mentions
     * @param {object} options - An object of options
     * @param {object} options.message - The message from which to get the roles from
     * @param {object} options.client - The client instance
     * @param {string} [options.text=message.content] - The text from which roles should be resolved, if none provided, it will use the message content
     * @returns {Promise<User>} The resolved role, or false if none could be resolved
     */
    async getUserFromText(options = {}) {
        if (!options.client || !options.message) {
            Promise.reject(new Error(`The options.client and options.message parameters are mandatory`));
        }
        options.text = options.text || options.message.content;
        const exactMatch = await this._resolveUserByExactMatch(options.client, options.message, options.text);
        if (exactMatch) {
            return exactMatch;
        }
        //While it is unlikely, resolve the user by ID if possible
        if (options.message.channel.guild.members.get(options.text)) {
            return options.message.channel.guild.members.get(options.text);
        }

        if (options.message.mentions[0]) {
            return options.message.mentions[0];
        }

        return false;
    }

    /**
     * @param {*} client - The client instance
     * @param {*} message - The message
     * @param {*} text - The text
     * @private
     * @returns {Promise<User>} The user, or false if none found
     */
    async _resolveUserByExactMatch(client, message, text) {
        //Filter the members with a username or nickname that match exactly the text
        const exactMatches = message.channel.guild.members.filter(m =>
            m.username.toLowerCase().split(/\s+/).join(" ") === text.toLowerCase().split(/\s+/).join(" ") ||
            (m.nick && m.nick.toLowerCase().split(/\s+/).join(" ") === text.toLowerCase().split(/\s+/).join(" ")));
        if (exactMatches.length === 1) {
            return exactMatches[0];
        } else if (exactMatches.length > 1) {
            let i = 1;
            await message.channel.createMessage({
                embed: {
                    title: ':mag: User search',
                    description: 'I found multiple users with that name, select one by answering with their corresponding number```\n' + exactMatches.map(m => `[${i++}] - ${m.username}#${m.user.discriminator}`).join("\n") + "```",
                    footer: {
                        text: 'Time limit: 60 seconds'
                    }
                }
            });
            const reply = await client.messageCollector.awaitMessage(message.channel.id, message.author.id, 60000).catch(err => {
                client.bot.emit("error", err);
                return false;
            });
            return exactMatches[reply.content - 1] ? exactMatches[reply.content - 1] : false;
        }
    }

    /**
     * Try to resolve a role with IDs or names
     * @param {object} options - An object of options
     * @param {object} options.message - The message from which to get the roles from
     * @param {object} options.client - The client instance
     * @param {string} [options.text=message.content] - The text from which roles should be resolved, if none provided, it will use the message content
     * @returns {Promise<Role>} The resolved role, or false if none could be resolved
     */
    async getRoleFromText(options = {}) {
        if (!options.client || !options.message) {
            Promise.reject(new Error(`The options.client and options.message parameters are mandatory`));
        }
        options.text = options.text || options.message.content;
        const exactMatch = await this._resolveRoleByExactMatch(options.client, options.message, options.text)
        if (exactMatch) {
            return exactMatch;
        }
        //While it is very unlikely, resolve the role by ID if possible
        if (options.message.channel.guild.roles.get(options.text)) {
            return options.message.channel.guild.roles.get(options.text);
        }
        return false;
    }

    /**
     * @param {*} client - The client instance
     * @param {*} message - The message
     * @param {*} text - The text
     * @private
     * @returns {Promise<Role>} The role, or false if none found
     */
    async _resolveRoleByExactMatch(client, message, text) {
        const exactMatches = message.channel.guild.roles.filter(r => r.name.toLowerCase().split(/\s+/).join(" ") === text.toLowerCase().split(/\s+/).join(" "));
        if (exactMatches.length === 1) {
            return exactMatches[0];
        } else if (exactMatches.length > 1) {
            let i = 1;
            await message.channel.createMessage({
                embed: {
                    title: ':mag: Role search',
                    description: 'I found multiple roles with that name, select one by answering with their corresponding number```\n' + exactMatches.map(r => `[${i++}] - ${r.name} (Position: ${r.position} ; Hoisted: ${r.hoist ? "Yes" : "No"})`).join("\n") + "```",
                    footer: {
                        text: 'Time limit: 60 seconds'
                    }
                }
            });
            const reply = await client.messageCollector.awaitMessage(message.channel.id, message.author.id, 60000).catch(err => {
                client.bot.emit("error", err);
                return false;
            });
            return exactMatches[reply.content - 1] ? exactMatches[reply.content - 1] : false;
        }
    }

    /**
     * Handle the internal permissions system checking
     * Check if the given member has the permission tu run the given command
     * @param {object} member - The member to check the permissions for
     * @param {object} channel - The channel in which the command has been used (checks for channel-wide permissions)
     * @param {object} command - The command object from which to check if the member has permissions to use it
     * @param {object} client - The client instance
     * @returns {Promise<boolean>} A boolean representing whether the member is allowed to use this command
     */
    async memberHasPermissions(member, channel, command, client) {

        const guildEntry = await client.database.getGuild(member.guild.id);
        let allowed = false;

        function getPrioritaryPermission(target, targetID) {
            let targetPos;
            if (Array.isArray(guildEntry.permissions[target])) {
                targetPos = guildEntry.permissions[target].find(t => t.id === targetID);
            } else {
                targetPos = guildEntry.permissions[target];
            }
            let isAllowed;
            if (!targetPos) {
                return undefined;
            }
            //Give priority to commands over categories by checking them after the categories
            if (targetPos.allowedCommands.includes(`${command.help.category}*`)) {
                isAllowed = true;
            }
            if (targetPos.restrictedCommands.includes(`${command.help.category}*`)) {
                isAllowed = false;
            }
            if (targetPos.allowedCommands.includes(command.help.name)) {
                isAllowed = true;
            }
            if (targetPos.restrictedCommands.includes(command.help.name)) {
                isAllowed = false;
            }
            return isAllowed;
        }

        guildEntry.permissions.default = client.refs.defaultPermissions;

        //Filter the user roles that aren't in the database, sort them by position and finally map them to iterate through them later
        const rolesInDB = member.roles.filter(role => guildEntry.permissions.roles.find(r => r.id === role)).sort((a, b) => member.guild.roles.get(a).position -
            member.guild.roles.get(b).position).map(r => { return { name: "roles", id: r }; });

        [{ name: "default" }, { name: "global" }, { name: "channels", id: channel.id }, ...rolesInDB, { name: "users", id: member.id }].forEach(val => {
            if (getPrioritaryPermission(val.name, val.id) !== undefined) {
                allowed = getPrioritaryPermission(val.name, val.id);
            }
        });

        if (member.permission.has("administrator")) {
            allowed = true;
        }

        if (command.help.category === "admin") {
            if (client.config.admins.includes(member.id)) {
                allowed = command.conf.ownerOnly && client.config.ownerID !== member.id ? false : true;
            } else {
                allowed = false;
            }
        }

        return allowed;
    }

    /**
     * Query to the user the arguments that they forgot to specify
     * @param {*} client - The client instance
     * @param {*} message - The message that triggered the command
     * @param {*} command - The command that the user is trying to run
     * @returns {Promise<Array>} An array of arguments
     */
    async queryMissingArgs(client, message, command) {
        let args = [];

        const queryArg = async(arg, ongoingQuery) => {
            const queryMsg = ongoingQuery || await message.channel.createMessage('Hoi ! Seems like you forgot a parameter for this command, note that you can cancel this query anytime by replying `cancel`\n\n' + arg.description);
            const response = await client.messageCollector.awaitMessage(message.channel.id, message.author.id);
            if (!response || response.content.toLowerCase() === "cancel") {
                queryMsg.delete().catch();
                return false;
            }
            if (arg.possibleValues && !arg.possibleValues.filter(value => value.name === "*" || value.name.toLowerCase() === response.content.toLowerCase())[0]) {
                message.channel.createMessage(':x: This is not a valid answer, please reply again with a valid answer')
                    .then(m => {
                        setTimeout(() => {
                            m.delete().catch();
                        }, 5000);
                    });
                queryArg(arg, queryMsg)
                    .then(r => {
                        return r;
                    });
            } else {
                queryMsg.delete().catch();
                const value = arg.possibleValues ? arg.possibleValues.find(value => value.name.toLowerCase() === response.content.toLowerCase() || value.name === '*') : false;
                return value ? (value.interpretAs === false ? undefined : value.interpretAs.replace(/{value}/gim, response.content.toLowerCase())) : response.content;
            }
        };

        for (const element of command.conf.expectedArgs) {
            if ((element.condition && element.condition(client, message, args)) || !element.condition) {
                const query = await queryArg(element)
                    .catch(err => {
                        client.bot.emit('error', err, message);
                        return false;
                    });
                if (query === false) {
                    message.channel.createMessage(':x: Command aborted').catch();
                    return false;
                }
                if (query !== undefined) {
                    args.push(query);
                }
            }
        }

        return args;
    }
}

module.exports = Command;