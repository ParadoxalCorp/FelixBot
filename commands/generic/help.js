class Help {
    constructor() {
        this.help = {
            name: 'help',
            description: 'Display a list of all the available commands or the detailed help of a specific command',
            usage: 'help ping',
            category: 'generic'
        }
        this.conf = {
            aliases: ['halp', 'h']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const prefix = message.guild ? client.guildData.get(message.guild.id).generalSettings.prefix : client.config.prefix;
                const categories = ["generic", "misc", "image", "utility", "fun", "moderation", "settings"];
                if (client.config.admins.includes(message.author.id)) categories.push('admin'); //If felix admin then show admin commands
                let overallHelp = new String();
                for (let i = 0; i < categories.length; i++) {
                    const categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
                    overallHelp += `**${categories[i]}** =>` + categoryCommands.map(c => `\`${c.help.name}\` `) + "\n\n";
                }
                overallHelp = overallHelp.replace(/undefined/gim, ""); //To remove the "undefined"
                //--------------------------------------------------------Return overall help if no args-----------------------------------------------------
                if (args.length === 0) return resolve(await message.channel.createMessage(`Here's the list of all commands categories and their respective commands. Use \`${prefix}help command name\` to see the detailed description of a command\n\n` + overallHelp + `\n\n**Tips**\nYou can run up to 3 commands at once using \`&&\`, so for example: \`${prefix}ping && ${prefix}awoo\`\nIf you made a typo while writting a command, as long as its your last message, you can edit it: Felix will run it`));
                //-------------------------------------------------------Else return specified command help-------------------------------------------
                const arg = args[0].toLowerCase(); //remove case sensitivity
                const commandHelp = client.commands.get(arg) || client.commands.get(client.aliases.get(arg));
                if (!commandHelp) return resolve();
                let aliases = 1 <= commandHelp.conf.aliases ? commandHelp.conf.aliases.join(', ') : "None";
                let detailedUsage = commandHelp.help.detailedUsage ? commandHelp.help.detailedUsage.replace(/\{prefix\}/gim, `${prefix}`) : "There is no detailed usage for this command";
                let parameters = commandHelp.help.parameters ? commandHelp.help.parameters : "None";
                let shortcuts = "None";
                if (commandHelp.shortcut) {
                    let keys = Array.from(commandHelp.shortcut.triggers.keys());
                    shortcuts = keys.map(k => `\`${k}\` ${commandHelp.shortcut.triggers.get(k).help}`).join('\n');
                }
                resolve(await message.channel.createMessage(`${commandHelp.help.description}\n**Parameters:** ${parameters}\n**Usage Example:**\n\`${prefix + commandHelp.help.usage}\`\n**Category:** \`${commandHelp.help.category}\`\n**Aliases:** \`${aliases}\`\n**Detailed usage:**\n${detailedUsage}\n**Shortcuts:**\n${shortcuts}`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Help();