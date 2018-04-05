const Command = new(require('../util/helpers/Command'));

module.exports = async(client, message) => {
    if (message.author.bot) {
        return;
    }
    const command = await Command.parseCommand(message, client);
    if (!command) {
        return;
    }
    let guildEntry;
    if (client.database && client.database.healthy) {
        let userEntry = await client.database.getUser(message.author.id);
        if (!userEntry) {
            userEntry = await client.database.set(client.refs.userEntry(message.author.id))
                .catch(err => {
                    client.bot.emit("error", err);
                    return message.channel.createMessage(`:x: An error occurred`);
                });
        }
        if (userEntry.blacklisted) {
            return;
        }
        if (message.channel.guild) {
            guildEntry = await client.database.getGuild(message.channel.guild.id);
            if (!guildEntry) {
                guildEntry = await client.database.set(client.refs.guildEntry(message.channel.guild.id), "guild")
                    .catch(err => {
                        client.bot.emit("error", err);
                        return message.channel.createMessage(`:x: An error occurred`);
                    });
            }
        }
    }
    if (command.conf.guildOnly && !message.channel.guild) {
        return message.channel.createMessage(`:x: This command may only be used in guilds and not in private messages`);
    }

    //If the command has been used in DM, ignore this check, commands that work in DM should not require any guild-related permission
    const clientHasPermissions = message.channel.guild ? Command.clientHasPermissions(message, client, command.conf.requirePerms) : true;

    if (!Array.isArray(clientHasPermissions)) {
        if (command.conf.disabled) {
            return message.channel.createMessage(command.conf.disabled);
        }

        if ((!client.database || !client.database.healthy) || !message.channel.guild) {
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

            if (!allowed) {
                return message.channel.createMessage(`:x: You don't have the permission to use this command`).catch();
            }

            command.run(client, message, message.content.split(" ").splice(2))
                .catch(err => {
                    client.bot.emit("error", err, message);
                });
        } else {
            await Command.memberHasPermissions(message.channel.guild.members.get(message.author.id), message.channel, command, client)
                .then(isAllowed => {
                    if (!isAllowed) {
                        return message.channel.createMessage(`:x: You don't have the permission to use this command`).catch();
                    }

                    command.run(client, message, message.content.split(" ").splice(2), guildEntry)
                        .catch(err => {
                            client.bot.emit("error", err, message);
                        });
                })
                .catch(err => {
                    return client.bot.emit("error", err, message);
                });
        }
    } else {
        if (clientHasPermissions.includes("sendMessages")) {
            return;
        }
        message.channel.createMessage(`:x: I need the following permission(s) to run that command: ` + clientHasPermissions.map(p => `\`${p}\``).join(', '));
    }
};