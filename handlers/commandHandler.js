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
        if (commandFile.conf.guildOnly || (commandFile.help.category === 'admin' && !client.config.admins.includes(message.author.id))) return await message.channel.send(":x: This command can only be used in a guild or you don't have the permission to use it");
        if (commandFile.conf.disabled !== false) return await message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        try {
            await commandFile.run(client, message, args);
            client.cmdsUsed++;
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
        if ((!client.commands.has(supposedCommand)) && (!client.aliases.has(supposedCommand))) return; //Just return if the command is not found
        if (!client.userData.has(message.author.id)) client.userData.set(message.author.id, client.defaultUserData(message.author.id)); //Once the command is confirmed
        let command = client.commands.get(supposedCommand) ? client.commands.get(supposedCommand).help.name : client.commands.get(client.aliases.get(supposedCommand)).help.name
        if (client.ratelimited.has(message.author.id)) return await message.channel.send(`:x: Chill a bit, there, a 20 seconds cooldown for ya :heart:`);
        //else if (client.commands.get(client.aliases.get(supposedCommand))) command = ;
        const commandFile = require(`../commands/${command}.js`);
        //Back to the first command
        if (commandFile.conf.disabled) return message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        const allowed = await require(`../handlers/permissionsChecker.js`)(client, message, client.commands.get(command));
        if (allowed) { //If the user is allowed
            try {
                if (message.guild.members.size >= 250) message.guild.members = await message.guild.fetchMembers();
                let multipleCmds = message.content.split('&&');
                if (multipleCmds.length > 1) message.content = multipleCmds[0];
                //Shortcuts
                if (commandFile.shortcut && args.filter(a => commandFile.shortcut.triggers.has(a.toLowerCase())).length > 0) {
                    let trigger = args.filter(a => commandFile.shortcut.triggers.has(a.toLowerCase()))[0];
                    //Handle missing argument here to save a line in every shortcut script
                    if (commandFile.shortcut.triggers.get(trigger).args && (args.length - 1) < commandFile.shortcut.triggers.get(trigger).args) return await message.channel.send(`:x: You didn't specified any or not enough arguments`);
                    await require(`../modules/shortcuts/${command}/${commandFile.shortcut.triggers.get(trigger).script}`)(client, message, args);
                }
                //Default command 
                else await commandFile.run(client, message);
                //Command confirmed, check for multiple commands
                multipleCmds.shift();
                if (multipleCmds[0]) {
                    //Emit a new message for all supposed commands, limit to 3 commands max once tho because nu spam
                    for (let i = 0; i < multipleCmds.length && i < 2; i++) {
                        let newMessage = message;
                        newMessage.content = multipleCmds[i].trim();
                        client.emit('message', newMessage);
                        await client.sleep(1000);
                    }
                    //Ratelimit
                    client.ratelimited.add(message.author.id);
                    setTimeout(() => {
                        client.ratelimited.delete(message.author.id);
                    }, 20000);
                }
            } catch (err) {
                client.emit('commandFail', message, err);
            } finally {
                client.commands.get(command).uses++;
                client.cmdsUsed++;
            }
        } else return await message.channel.send(":x: You don't have the permission to use this command !");
    }
}