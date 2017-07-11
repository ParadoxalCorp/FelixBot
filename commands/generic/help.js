exports.run = async (client, message) => {
    try {
        const categories = ["generic", "utility", "image", "fun", "moderation", "settings"]; //An array of all commands categories
        if (message.content.indexOf(" ") === -1) { //If there is no whitespace, so if there is no specific commands/category requested
            var globalHelp = `Here's the list of all commands categories. Use \`${client.prefix}help category name\` to see all the commands of this category or use \`${client.prefix}help command name\` to see the detailled description of a command\n`;
            categories.forEach(async function (category) {
                globalHelp += `\`${category}\`\n-\n`;
            });
            return await message.channel.send(globalHelp);
        } else {
            const arg = message.content.substr(message.content.indexOf(" ") + 1).trim().toLowerCase(); //Trim it in case there is a double space or whatever and remove case sensitivity
            if (categories.indexOf(arg) !== -1) { //If the arg is a category name, returns this category commands
                const categoryCommands = client.commands.filter(c => c.help.category == arg);
                var categoryHelp = `Here's the list of this category commands. Use \`${client.prefix}help command name\` to see the detailled description of a command\n`;
                categoryHelp += categoryCommands.map(c => `**${c.help.name}:** ${c.help.description}\n`);
                const categoryHelpCleaned = categoryHelp.replace(/\,\*\*/gim, "**"); //Remove the annoying "," which was there because of the mapping
                return await message.channel.send(categoryHelpCleaned);
            } else if (client.commands.has(arg)) {
                const commandHelp = client.commands.get(arg);
                var aliases;
                if (1 <= commandHelp.conf.aliases.length) { //Check if the command has aliases
                    aliases = commandHelp.conf.aliases.toString();
                } else {
                    aliases = "None";
                }                
                var parameters;
                if (commandHelp.help.parameters) {
                     parameters = commandHelp.help.parameters.toString();
                } else {
                     parameters = "None";
                }
                return await message.channel.send(`${commandHelp.help.description}\n**Parameters:** ${parameters}\n**Usage Example:**\n\`${client.prefix + commandHelp.help.usage}\`\n**Category:** \`${commandHelp.help.category}\`\n**Aliases:** \`${aliases}\``);
            } else if (client.aliases.has(arg)) { //If its a command alias
                const commandHelp = client.commands.get(client.aliases.get(arg));
                const aliases = commandHelp.conf.aliases.toString();
                var parameters;
                if (commandHelp.help.parameters) {
                     parameters = commandHelp.help.parameters.toString();
                } else {
                     parameters = "None";
                }
                return await message.channel.send(`${commandHelp.help.description}\n**Parameters:** ${parameters}\n**Usage Example:**\n\`${client.prefix + commandHelp.help.usage}\`\n**Category:** \`${commandHelp.help.category}\`\n**Aliases:** \`${aliases}\``);
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
