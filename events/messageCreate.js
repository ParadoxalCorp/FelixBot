const Command = new(require('../util/helpers/Command'));

class MessageHandler {
    constructor() {}

    async handle(client, message) {
        if (message.author.bot) {
            return;
        }
        const command = await Command.parseCommand(message, client);
        if (!command) {
            return;
        }
        const databaseEntries = await this.getDatabaseEntries(client, message);
        if (databaseEntries.user && databaseEntries.user.blackListed) {
            return;
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
        this.runCommand(client, message, command, databaseEntries);
    }

    async getDatabaseEntries(client, message) {
        const databaseEntries = {
            user: null,
            guild: null
        };
        const handleRejection = (err) => {
            client.bot.emit('error', err, message);
        }
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
            allowed = await Command.memberHasPermissions(message.channel.guild.members.get(message.author.id), message.channel, command, client)
                .catch(err => {
                    client.bot.emit('error', err, message);
                });
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
        let args = message.content.split(/\s+/gim).splice(2);
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
    }

}

module.exports = new MessageHandler().handle.bind(new MessageHandler());