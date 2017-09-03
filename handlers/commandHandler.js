module.exports = async(client, message) => {
    const guildEntry = client.guildData.get(message.guild.id);
    if (message.channel.type === "dm") {
        if (!message.content.startsWith(client.database.Data.global[0].prefix)) return;
        client.prefix = client.database.Data.global[0].prefix;
        // Someone once told me that it was the best way to define args
        const args = message.content.split(/\s+/g);
        const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
        var command;
        if (client.commands.get(supposedCommand)) { //first check if its the main command name, if not, then check if its an alias
            command = client.commands.get(supposedCommand).help.name;
        } else if (client.commands.get(client.aliases.get(supposedCommand))) {
            command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
        }
        if (!command) return;
        if (!client.userData.get(message.author.id)) { //Once the command is confirmed
            client.userData.set(message.author.id, client.defaultUserDatas);
        }
        if ((client.userData.get(message.author.id).blackListed === "yes") && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users
        const commandFile = require(`../commands/${command}.js`);
        if (commandFile.conf.guildOnly) {
            return await message.channel.send(":x: This command can only be used in a guild");
        }
        if (commandFile.conf.disabled !== false) {
            return await message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        }
        try {
            commandFile.run(client, message, args);
            return client.cmdsUsed++;
        } catch (err) {
            console.error(err);
            client.Raven.captureException(err);
        }
    } else {
        if (!message.content.startsWith(guildEntry.generalSettings.prefix)) return;
        client.prefix = guildEntry.generalSettings.prefix;
        // Someone once told me that it was the best way to define args
        const args = message.content.split(/\s+/g);
        const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
        if ((!client.commands.get(supposedCommand)) && (!client.aliases.get(supposedCommand))) return; //Just return if the command is not found
        if (!client.userData.get(message.author.id)) { //Once the command is confirmed
            client.userData.set(message.author.id, client.defaultUserData);
        }
        var command;
        if (client.commands.get(supposedCommand)) { //first check if its the a main command name, if not, then check if its an alias
            command = client.commands.get(supposedCommand).help.name;
        } else if (client.commands.get(client.aliases.get(supposedCommand))) {
            command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
        }
        const commandFile = require(`../commands/${command}.js`);
        if (commandFile.conf.disabled !== false) {
            return message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        }
        const userLevel = await require(`../handlers/permissionsChecker.js`)(client, message);
        if (userLevel >= commandFile.conf.permLevel) { //If the user level is higher or equal to the requested command level, then run the command
            try {
                client.cmdsUsed++;
                client.cmdsLogs += `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] Command ${command} triggered, current memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1000).toFixed(2)}MB\n`
                await commandFile.run(client, message, args);
                client.cmdsLogs += `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] new memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1000).toFixed(2)}MB\n`
            } catch (err) {
                console.error(err);
                client.Raven.captureException(err);
            }
        } else {
            return await message.channel.send(":x: You don't have the permission to use this command !");
        }
    }
}