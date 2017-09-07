exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/gim);
            args.shift();
            const categories = ["generic", "miscellaneous", "image", "utility", "fun", "moderation", "settings"];
            client.overallHelp = ""; //Nullify the one made in index.js
            for (let i = 0; i < categories.length; i++) {
                const categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
                client.overallHelp += `**${categories[i]}** =>` + categoryCommands.map(c => `\`${c.help.name}\` `) + "\n\n";
            }
            client.overallHelp = client.overallHelp.replace(/undefined/gim, ""); //To remove the "undefined"
            if (args.length === 0) { //--------------------------------------------------------Return overall help if no args-----------------------------------------------------
                return resolve(await message.channel.send(`Here's the list of all commands categories and their respective commands. Use \`${client.prefix}help command name\` to see the detailled description of a command\n\n` + client.overallHelp));
            } else {
                const arg = args[0].toLowerCase(); //remove case sensitivity
                const commandHelp = client.commands.get(arg) || client.commands.get(client.aliases.get(arg));
                if (!commandHelp) return resolve();
                var aliases = "None";
                var detailledUsage = "There is no detailled usage for this command";
                var parameters = "None"
                if (1 <= commandHelp.conf.aliases.length) aliases = commandHelp.conf.aliases.toString();
                if (commandHelp.help.detailledUsage) detailledUsage = commandHelp.help.detailledUsage.replace(/\{prefix\}/gim, `${client.prefix}`);
                if (commandHelp.help.parameters) parameters = commandHelp.help.parameters.toString();
                return resolve(await message.channel.send(`${commandHelp.help.description}\n**Parameters:** ${parameters}\n**Usage Example:**\n\`${client.prefix + commandHelp.help.usage}\`\n**Category:** \`${commandHelp.help.category}\`\n**Aliases:** \`${aliases}\`\n**Detailled Usage:**\n${detailledUsage}`));
            }
        } catch (err) {
            reject(client.emit('commandFail', message));
        }
    });
};

exports.conf = {
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