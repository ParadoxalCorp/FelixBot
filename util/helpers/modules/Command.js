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
            const guildEntry = message.channel.guild && client.database && client.database.healthy ?
                await client.database.getGuild(message.channel.guild.id).catch(err => {
                    return reject(err);
                }) :
                false;
            let prefixes = client.prefixes.map(p => p); //Clone client.prefixes to not modify it
            let prefix = args[0];
            let command = args[1];
            if (guildEntry && guildEntry.prefix) {
                if (!guildEntry.spacedPrefix) {
                    const unspacedParsing = this._parseUnspacedCommand(message, client, guildEntry, args);
                    prefix = unspacedParsing.prefix;
                    command = unspacedParsing.command;
                }
                prefixes.push(guildEntry.prefix);
                prefixes = prefixes.filter(p => (guildEntry.spacedPrefix && p !== client.config.prefix) || !guildEntry.spacedPrefix);
            }
            if (!prefixes.find(p => p === prefix)) {
                return resolve(undefined);
            }
            return resolve(client.commands.get(command.toLowerCase()) || client.commands.get(client.aliases.get(command.toLowerCase())));
        });
    }

    _parseUnspacedCommand(message, client, guildEntry, args) {
        const mentionTest = message.content.startsWith(`<@${client.bot.user.id}>`) || message.content.startsWith(`<@!${client.bot.user.id}`);
        const supposedCommand = !mentionTest
        ? args.shift().slice(guildEntry.getPrefix.length).toLowerCase() 
        : (args[1] ? args[1].toLowerCase() : false);
        const prefix = !mentionTest ? message.content.substr(0, guildEntry.getPrefix.length) : args[0];
        return {
            prefix,
            command: supposedCommand
        }
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
            const hasChannelOverwrite = Command.hasChannelOverwrite(channel, clientMember, perm);
            if (!clientMember.permission.has(perm)) {
                if (!hasChannelOverwrite) {
                    return false;
                } else {
                    return hasChannelOverwrite.has(perm) ? true : false;
                }
            } else {
                if (!hasChannelOverwrite) {
                    return true;
                } else {
                    return hasChannelOverwrite.has(perm) ? true : false;
                }
            }
        }

        permissions.forEach(perm => {
            if (!hasPerm(perm, this)) {
                missingPerms.push(perm);
            }
        });
        if (!permissions.includes('sendMessages') && !hasPerm('sendMessages', this)) {
            missingPerms.push('sendMessages');
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
     * @param {object} options.client - The client instance
     * @param {object} options.message - The message from which to get the user from
     * @param {string} [options.text=message.content] - The text from which users should be resolved, if none provided, it will use the message content
     * @returns {Promise<User>} The resolved user, or false if none could be resolved
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

        const mention = new RegExp(/<@|<!@/g);
        if (mention.test(options.text)) {
            const id = options.text.replace(/<@!/g, '').replace(/<@/g, '').replace(/>/g, '');
            const user = options.client.bot.users.get(id);
            return user ? options.client.extendedUser(user) : false;
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
     * @param {object} options.client - The client instance
     * @param {object} options.message - The message from which to get the roles from
     * @param {string} [options.text=message.content] - The text from which roles should be resolved, if none provided, it will use the message content
     * @returns {Promise<Role>} The resolved role, or false if none could be resolved
     */
    async getRoleFromText(options = {}) {
        if (!options.client || !options.message) {
            Promise.reject(new Error(`The options.client and options.message parameters are mandatory`));
        }
        options.text = options.text || options.message.content;
        const exactMatch = await this._resolveRoleByExactMatch(options.client, options.message, options.text);
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
     * 
     * @param {object} options - An object of options
     * @param {object} options.client - The client instance
     * @param {object} options.message - The message
     * @param {string} [options.text=message.content] - The text to resolve a channel from
     * @param {boolean} [options.textual=true] - Whether the channel to resolve is a text channel or a voice channel
     * @returns {Promise<object|boolean>} The channel object, or false if none found
     */
    async getChannelFromText(options) {
        const text = options.text || options.message.content;

        if (typeof options.textual === 'undefined') {
            options.textual = true;
        }
        const exactMatch = await this._resolveChannelByExactMatch(options.client, options.message, options.text, options.textual);
        if (exactMatch) {
            return exactMatch;
        }

        //While it is very unlikely, resolve the role by ID (and mention) if possible
        options.text = options.text.replace(/<|>|#/g, '');
        if (options.message.channel.guild.channels.get(options.text)) {
            return options.message.channel.guild.channels.get(options.text);
        }

        return false;
    }

    /**
     * @param {*} client - The client instance
     * @param {*} message - The message
     * @param {string} text - The text
     * @param {boolean} textual - Whether the channel is a text channel or a voice channel
     * @private
     * @returns {Promise<Role>} The role, or false if none found
     */
    async _resolveChannelByExactMatch(client, message, text, textual) {
        const exactMatches = message.channel.guild.channels.filter(c => c.name === text && c.type === (textual ? 0 : 2));
        if (exactMatches.length === 1) {
            return exactMatches[0];
        } else if (exactMatches.length > 1) {
            let i = 1;
            await message.channel.createMessage({
                embed: {
                    title: ':mag: Channel search',
                    description: 'I found multiple channels with that name, select one by answering with their corresponding number```\n' + exactMatches.map(c => `[${i++}] - ${c.name} (Topic: ${c.topic ? c.topic.substr(0, 42) + '...' : 'None'} ; Bitrate: ${c.bitrate ? c.bitrate : "None (text channel)"})`).join("\n") + "```",
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
     * Query to the user the arguments that they forgot to specify
     * @param {*} client - The client instance
     * @param {*} message - The message that triggered the command
     * @param {*} command - The command that the user is trying to run
     * @returns {Promise<Array>} An array of arguments
     */
    async queryMissingArgs(client, message, command) {
        let args = [];

        const queryArg = async(arg, ongoingQuery) => {
            const queryMsg = ongoingQuery || await message.channel.createMessage('Note that you can cancel this query anytime by replying `cancel`\n\n' + arg.description);
            const response = await client.messageCollector.awaitMessage(message.channel.id, message.author.id);
            if (!response || response.content.toLowerCase() === "cancel") {
                queryMsg.delete().catch(() => {});
                return false;
            }
            if ((arg.possibleValues && !arg.possibleValues.find(value => value.name === "*" || value.name.toLowerCase() === response.content.toLowerCase())) || (arg.validate && !arg.validate(client, message, response.content))) {
                message.channel.createMessage(':x: This is not a valid answer, please reply again with a valid answer')
                    .then(m => {
                        setTimeout(() => {
                            m.delete().catch(() => {});
                        }, 5000);
                    });
                const reQuery = await queryArg(arg, queryMsg);
                return reQuery;
            } else {
                queryMsg.delete().catch(() => {});
                const value = arg.possibleValues ? arg.possibleValues.find(value => value.name.toLowerCase() === response.content.toLowerCase() || value.name === '*') : false;
                return value ? (value.interpretAs === false ? undefined : value.interpretAs.replace(/{value}/gim, response.content.toLowerCase())) : response.content;
            }
        };

        for (const element of command.conf.expectedArgs) {
            const condition = element.condition ? await element.condition(client, message, args) : undefined;
            if (condition || typeof condition === 'undefined') {
                const query = await queryArg(element)
                    .catch(err => {
                        client.bot.emit('error', err, message);
                        return false;
                    });
                if (query === false) {
                    message.channel.createMessage(':x: Command aborted').catch(() => {});
                    return false;
                }
                if (query !== undefined) {
                    args.push(query);
                }
            }
        }

        return args;
    }

    /**
     * Resolve a user from a user resolvable and returns an extended user
     * Note that if the user is not found, only username, discriminator and tag are guaranteed (set to unknown) 
     * @param {*} client - The client instance
     * @param {*} userResolvable - A user resolvable, can be an ID, a username#discriminator pattern or a user object
     * @returns {extendedUser} returns an extended user object
     */
    resolveUser(client, userResolvable) {
        const defaultUser = { username: 'Unknown', discriminator: 'Unknown' };
        if (!isNaN(userResolvable)) {
            const user = client.bot.users.get(userResolvable);
            return client.extendedUser(user ? user : defaultUser);
        } else if (typeof userResolvable === 'string') {
            const spliced = userResolvable.split('#');
            const user = client.bot.users.filter(u => u.username === spliced[0] && u.discriminator === spliced[1]).random();
            return client.extendedUser(user ? user : defaultUser);
        } else if (typeof userResolvable === 'object') {
            return client.extendedUser(userResolvable);
        }
    }

    /**
     * Get the highest role of the specified member and returns it
     * @param {object|string} member - The member object or their ID
     * @param {*} guild - The guild object
     * @returns {*} The highest role of the user
     */
    getHighestRole(member, guild) {
        member = member.id ? member : guild.members.get(member);
        const filteredRoles = guild.roles.filter(r => member.roles.includes(r.id));
        return filteredRoles.sort((a, b) => b.position - a.position)[0];
    }

    /**
     * Get a HEX code from decimals
     * @param {number} decimal - The decimal(s) to convert to a HEX representation
     * @returns {string} The HEX code, without the leading hashtag
     */
    getHexColor(decimal) {
        let col = decimal.toString(16);
        //If the decimal is 0
        while (col.length < 6) {
            col = `0${col}`;
        }
        return col;
    }
}

module.exports = Command;