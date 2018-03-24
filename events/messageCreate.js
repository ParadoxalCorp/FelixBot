const Command = new(require('../util/helpers/Command'));

module.exports = async(client, message) => {
    if (message.author.bot) {
        return;
    }
    const command = await Command.parseCommand(message, client);
    if (!command) {
        return;
    }
    if (client.database) {
        let userEntry = await client.database.getUser(message.author.id);
        if (!userEntry) {
            userEntry = await client.database.set(client.refs.userEntry(message.author.id))
                .catch(err => {
                    client.emit("error", err);
                    return message.channel.createMessage(`:x: An error occurred`);
                });
        }
        if (userEntry.blacklisted) {
            return;
        }
        if (message.channel.guild) {
            let guildEntry = await client.database.getGuild(message.channel.guild.id);
            if (!guildEntry) {
                guildEntry = await client.database.set(client.refs.guildEntry(message.channel.guild.id), "guild")
                    .catch(err => {
                        client.emit("error", err);
                        return message.channel.createMessage(`:x: An error occurred`);
                    });
            }
        }
    }
    if (command.conf.guildOnly && !message.channel.guild) {
        return message.channel.createMessage(`:x: This command may only be used in guilds and not in private messages`);
    }
    const hasPermissions = Command.hasPermissions(message, client, command.conf.requirePerms);
    if (!Array.isArray(hasPermissions)) {
        if (command.conf.disabled) {
            return message.channel.createMessage(command.conf.disabled);
        }
        command.run(client, message, message.content.split(" ").splice(2))
            .catch(err => {
                client.emit("error", err, message);
            });
    } else {
        if (hasPermissions.includes("sendMessages")) {
            return;
        }
        message.channel.createMessage(`:x: I need the following permission(s) to run that command: ` + hasPermissions.map(p => `\`${p}\``).join(', '));
    }
};