exports.run = async(client, message) => {
    try {
        if (message.content.indexOf(" ") === -1) { //If there is no whitespace, so if there is no specific commands/category requested
            var globalHelp = `Here's the list of all commands categories and their respective commands. Use \`${client.prefix}help command name\` to see the detailled description of a command\n\n`;
            return await message.channel.send(globalHelp + client.overallHelp);
        } else {
            const arg = message.content.substr(message.content.indexOf(" ") + 1).trim().toLowerCase(); //Trim it in case there is a double space or whatever and remove case sensitivity
            if (client.commands.has(arg)) {
                const commandHelp = client.commands.get(arg);
                var aliases;
                var detailledUsage;
                if (1 <= commandHelp.conf.aliases.length) { //Check if the command has aliases
                    aliases = commandHelp.conf.aliases.toString();
                } else {
                    aliases = "None";
                }
                if (commandHelp.help.detailledUsage) { //Check if the command has aliases
                    detailledUsage = commandHelp.help.detailledUsage;
                    detailledUsage = detailledUsage.replace(/\{prefix\}/gim, `${client.prefix}`);
                } else {
                    detailledUsage = "There is no detailled usage for this command";
                }
                var parameters;
                if (commandHelp.help.parameters) { //Check if the command has parameters
                    parameters = commandHelp.help.parameters.toString();
                } else {
                    parameters = "None";
                }
                return await message.channel.send(`${commandHelp.help.description}\n**Parameters:** ${parameters}\n**Usage Example:**\n\`${client.prefix + commandHelp.help.usage}\`\n**Category:** \`${commandHelp.help.category}\`\n**Aliases:** \`${aliases}\`\n**Detailled Usage:**\n${detailledUsage}`);
            } else if (client.aliases.has(arg)) { //If its a command alias
                const commandHelp = client.commands.get(client.aliases.get(arg));
                var aliases;
                var detailledUsage;
                if (1 <= commandHelp.conf.aliases.length) { //Check if the command has aliases
                    aliases = commandHelp.conf.aliases.toString();
                } else {
                    aliases = "None";
                }
                if (commandHelp.help.detailledUsage) { //Check if the command has aliases
                    detailledUsage = commandHelp.help.detailledUsage;
                    detailledUsage = detailledUsage.replace(/\{prefix\}/gim, `${client.prefix}`);                    
                } else {
                    detailledUsage = "There is no detailled usage for this command";    
                }
                var parameters;
                if (commandHelp.help.parameters) { //Check if the command has parameters
                    parameters = commandHelp.help.parameters.toString();
                } else {
                    parameters = "None";
                }
                return await message.channel.send(`${commandHelp.help.description}\n**Parameters:** ${parameters}\n**Usage Example:**\n\`${client.prefix + commandHelp.help.usage}\`\n**Category:** \`${commandHelp.help.category}\`\n**Aliases:** \`${aliases}\`\n**Detailled Usage:**\n${detailledUsage}`);
            }
        }
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console       
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    disabled: false,
    aliases: ['h', 'halp'],
    permLevel: 0
};

exports.help = {
    name: 'help',
    description: 'Displays all the available commands.',
    category: 'generic',
    usage: 'help ping'
};
