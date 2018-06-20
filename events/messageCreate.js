'use strict';

const Command = new(require('../util/helpers/modules/Command'));

class MessageHandler {
    constructor() {}

    async handle(client, message) {
        if (message.author.bot) {
            return;
        }
        const databaseEntries = await this.getDatabaseEntries(client, message);
        if (databaseEntries.user && databaseEntries.user.blackListed) {
            return;
        }
        if (databaseEntries.guild && databaseEntries.guild.experience.enabled) {
            client.experienceHandler.handle(message, databaseEntries.guild, databaseEntries.user);
        }
        const command = await Command.parseCommand(message, client);
        if (!command) {
            return;
        }
        if (command.conf.disabled) {
            return message.channel.createMessage(`:x: Sorry but this command is disabled at the moment\nReason: ${command.conf.disabled}`);
        }
        if (command.conf.guildOnly && !message.channel.guild) {
            return message.channel.createMessage(`:x: This command may only be used in guilds and not in private messages`);
        }
        if ((!databaseEntries.user || (!databaseEntries.guild && command.conf.guildOnly)) && command.conf.requireDB) {
            return message.channel.createMessage(`:x: Sorry but this command require the database and the database seems unavailable at the moment`);
        }
        const clientHasPermissions = message.channel.guild ? Command.clientHasPermissions(message, client, command.conf.requirePerms) : true;
        if (Array.isArray(clientHasPermissions)) {
            if (clientHasPermissions.includes("sendMessages")) {
                return;
            }
            return message.channel.createMessage(`:x: I need the following permission(s) to run that command: ` + clientHasPermissions.map(p => `\`${p}\``).join(', ')).catch(() => {});
        }
        const memberHasPermissions = await this.memberHasPermissions(client, message, databaseEntries, command);
        if (!memberHasPermissions) {
            return message.channel.createMessage(`:x: You don't have the permission to use this command`).catch(() => {});
        }
        if (client.ratelimited.has(message.author.id) && client.ratelimited.get(message.author.id) >= 20) {
            return message.channel.createMessage(':x: Hoi hoi chill a little, there, a 20 seconds cooldown for you :heart:');
        }
        this.runCommand(client, message, command, databaseEntries);
    }

    async getDatabaseEntries(client, message) {
        const databaseEntries = {
            user: null,
            guild: null
        };
        const handleRejection = (err) => {
            client.bot.emit('error', err, message);
        };
        if (!client.database || !client.database.healthy) {
            return databaseEntries;
        }
        if (message.channel.guild) {
            await Promise.all([client.database.getUser(message.author.id), client.database.getGuild(message.channel.guild.id)])
                .then(entries => {
                    databaseEntries.user = entries[0].id === message.author.id ? entries[0] : entries[1];
                    databaseEntries.guild = entries[0].id === message.channel.guild.id ? entries[0] : entries[1];
                })
                .catch(handleRejection);
        } else {
            await client.database.getUser(message.author.id)
                .then(user => databaseEntries.user = user)
                .catch(handleRejection);
        }
        return databaseEntries;
    }

    async memberHasPermissions(client, message, databaseEntries, command) {
        let allowed = false;
        if (!databaseEntries.guild) {
            allowed = this._checkDefaultPermissions(client, message, command);
        } else {
            allowed = databaseEntries.guild.memberHasPermission(message.author.id, command, message.channel);
        }
        if (message.channel.guild && command.conf.guildOwnerOnly && (message.author.id !== message.channel.guild.ownerID)) {
            allowed = false;
        }
        return allowed;
    }

    _checkDefaultPermissions(client, message, command) {
        let allowed;

        if (client.refs.defaultPermissions.allowedCommands.includes(`${command.help.category}*`)) {
            allowed = true;
        }
        if (client.refs.defaultPermissions.restrictedCommands.includes(`${command.help.category}*`)) {
            allowed = false;
        }
        if (client.refs.defaultPermissions.allowedCommands.includes(command.help.name)) {
            allowed = true;
        }
        if (client.refs.defaultPermissions.restrictedCommands.includes(command.help.name)) {
            allowed = false;
        }

        if (message.channel.guild && message.channel.guild.members.get(message.author.id).permission.has("administrator")) {
            allowed = true;
        }

        if (command.help.category === "admin") {
            if (client.config.admins.includes(message.author.id)) {
                allowed = command.conf.ownerOnly && client.config.ownerID !== message.author.id ? false : true;
            } else {
                allowed = false;
            }
        }

        return allowed;
    }

    async runCommand(client, message, command, databaseEntries) {
        let queryMissingArgs;
        let args;
        const toSplice = databaseEntries.guild ? (databaseEntries.guild.spacedPrefix || message.content.startsWith(`<@${client.bot.user.id}>`) || message.content.startsWith(`<@!${client.bot.user.id}`) ? 2 : 1) : 2;
        if (message.content.includes('|')) {
            args = [message.content.split(/\|/g).splice(0, 1)[0].split(/\s+/g).splice(toSplice).join(' ').trim(), ...message.content.split(/\|/g).splice(1).map(a => a.trim())];
        }
        args = args || message.content.split(/\s+/gim).splice(toSplice);
        if (!args[0] && command.conf.expectedArgs[0]) {
            await Command.queryMissingArgs(client, message, command).catch((err) => err)
                .then(args => {
                    if (args) {
                        queryMissingArgs = args;
                    }
                })
                .catch(err => {
                    client.bot.emit('error', err, message);
                });
        }
        if (!queryMissingArgs && !args[0] && command.conf.expectedArgs[0]) {
            return;
        }

        command.run(client, message, queryMissingArgs || args, databaseEntries.guild, databaseEntries.user)
            .catch(err => {
                client.bot.emit('error', err, message);
            });
        const commandCooldownWeight = typeof command.conf.cooldownWeight === 'undefined' ? client.config.options.defaultCooldownWeight : command.conf.cooldownWeight;
        client.ratelimited.set(message.author.id, client.ratelimited.get(message.author.id) ?
            (client.ratelimited.get(message.author.id) + commandCooldownWeight) : commandCooldownWeight);
        setTimeout(() => {
            if (client.ratelimited.get(message.author.id) > commandCooldownWeight) {
                client.ratelimited.set(message.author.id, client.ratelimited.get(message.author.id) - commandCooldownWeight);
            } else {
                client.ratelimited.delete(message.author.id);
            }
        }, client.config.options.commandCooldownDuration);
    }

}

module.exports = new MessageHandler();