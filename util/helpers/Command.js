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
                prefixes = prefixes.filter(p => p !== client.config.prefix);
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
    hasPermissions(message, client, permissions, channel = message.channel) {
        const missingPerms = [];
        const clientMember = message.channel.guild.members.get(client.user.id);

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
     * Try to resolve a role with IDs, names, partial usernames or mentions
     * @param {object} options An object of options
     * @prop {object} options.guild The guild to check the roles for
     * @prop {string} options.text The text from which roles should be resolved
     * @prop {boolean} [options.multiple=false] Whether multiple roles should be resolved (in case the input contains multiple roles resolvable), this will be less accurate
     * @returns {Role|Collection<Role>} The resolved role, or a collection of resolved roles if options.multiple is true
     */
    getRoleResolvables(options = {}) {
        if (!options.guild || !options.text) {
            return new Error(`The options.guild and options.text parameters are required`);
        }
    }
}

module.exports = Command;