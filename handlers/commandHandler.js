module.exports = async(client, message) => {
    if (message.channel.type === "dm") {
        if (!message.content.startsWith(client.database.prefix)) return;
        client.prefix = client.database.prefix;
        // Someone once told me that it was the best way to define args
        const args = message.content.split(/\s+/g);
        const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
        var command;
        if (client.commands.get(supposedCommand)) command = client.commands.get(supposedCommand).help.name;
        else if (client.commands.get(client.aliases.get(supposedCommand))) command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
        if (!command) return;
        if (!client.userData.get(message.author.id)) client.userData.set(message.author.id, client.defaultUserData(message.author.id));
        const commandFile = require(`../commands/${command}.js`);
        if (commandFile.conf.guildOnly || (commandFile.help.category === 'admin' && !client.config.thingsLevel42.includes(message.author.id))) return await message.channel.send(":x: This command can only be used in a guild or you don't have the permission to use it");
        if (commandFile.conf.disabled !== false) return await message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        try {
            await commandFile.run(client, message, args);
            return client.cmdsUsed++;
        } catch (err) {
            console.error(err);
            client.Raven.captureException(err);
        }
    } else {
        const guildEntry = client.guildData.get(message.guild.id);
        if (!message.content.startsWith(guildEntry.generalSettings.prefix)) return;
        client.prefix = guildEntry.generalSettings.prefix;
        // Someone once told me that it was the best way to define args
        const args = message.content.split(/\s+/g);
        const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
        if ((!client.commands.get(supposedCommand)) && (!client.aliases.get(supposedCommand))) return; //Just return if the command is not found
        if (!client.userData.get(message.author.id)) { //Once the command is confirmed
            client.userData.set(message.author.id, client.defaultUserData(message.author.id));
        }
        let command;
        if (client.commands.get(supposedCommand)) command = client.commands.get(supposedCommand).help.name;
        else if (client.commands.get(client.aliases.get(supposedCommand))) command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
        const commandFile = require(`../commands/${command}.js`);
        if (commandFile.conf.disabled !== false) {
            return message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        }
        const allowed = await require(`../handlers/permissionsChecker.js`)(client, message, client.commands.get(command));
        if (allowed) { //If the user is allowed
            try {
                await commandFile.run(client, message);
            } catch (err) {
                console.error(err);
                client.Raven.captureException(err);
            } finally {
                client.commands.get(command).uses++;
                client.cmdsUsed++;
            }
        } else return await message.channel.send(":x: You don't have the permission to use this command !");
    }
}