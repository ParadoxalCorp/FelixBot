const fs = require("fs-extra");

class Help {
    constructor() {
        this.help = {
            name: 'help',
            description: 'Display a list of all the available commands or the detailed help of a specific command',
            usage: 'help ping',
            detailedUsage: '`{prefix}help -dm` The `-dm` parameter will send the help in dm instead of this channel\n`{prefix}help -allowed` Will only display commands that you are allowed to use\n`{prefix}help -all` Show all the commands, without hiding the disabled ones'
        }
        this.conf = {
            aliases: ['halp', 'h']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const prefix = message.guild ? client.guildData.get(message.guild.id).generalSettings.prefix : client.config.prefix;
                let categories = await fs.readdir(`./commands`);
                const dm = new RegExp(/-dm/gim).test(message.content);
                const allowed = new RegExp(/-allowed/gim).test(message.content);
                const all = new RegExp(/-all/gim).test(message.content);
                if (!client.config.admins.includes(message.author.id)) categories = categories.filter(c => c !== 'admin'); //If felix admin then show admin commands
                if (message.guild && !message.guild.members.get(message.author.id).hasPermission("administrator") && !dm && !all) {
                    categories = categories.filter(c => !client.guildData.get(message.guild.id).generalSettings.disabledModules.includes(`${c}*`));
                }
                let overallHelp = new String();
                for (let i = 0; i < categories.length; i++) {
                    let categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
                    if (allowed && !message.guild) categoryCommands = categoryCommands.filter(c => c.conf.guildOnly ? false : true);
                    else if (allowed && message.guild) categoryCommands = categoryCommands.filter(c => require(`../../util/helpers/permissionsChecker.js`)(client, message, c));
                    overallHelp += `**${categories[i]}** =>` + categoryCommands.filter(c => message.guild ? (!client.guildData.get(message.guild.id).generalSettings.disabledModules.includes(c.help.name) || all || message.guild.members.get(message.author.id).hasPermission("administrator")) : true).map(c => `\`${c.help.name}\` `) + "\n\n";
                }
                overallHelp = overallHelp.replace(/undefined/gim, ""); //To remove the "undefined"
                //--------------------------------------------------------Return overall help if no args-----------------------------------------------------
                if (args.length === 0 || dm || allowed || all) {
                    if (dm) return resolve(await message.author.createMessage(`Here's the list of all commands categories and their respective commands. Use \`${prefix}help command name\` to see the detailed description of a command\n\n` + overallHelp + `\n\n**Tips**\nIf you made a typo while writing a command, as long as its your last message, you can edit it: Felix will run it`));
                    else return resolve(await message.channel.createMessage(`Here's the list of all commands categories and their respective commands. Use \`${prefix}help command name\` to see the detailed description of a command\n\n` + overallHelp + `\n\n**Tips**\nIf you made a typo while writing a command, as long as its your last message, you can edit it: Felix will run it`));
                };
                //------------------------------------------------------Else return specified command help-------------------------------------------
                const arg = args[0].toLowerCase(); //remove case sensitivity
                const commandHelp = client.commands.get(arg) || client.commands.get(client.aliases.get(arg));
                if (!commandHelp) return resolve();
                const helpFields = [];
                if (commandHelp.conf.aliases) helpFields.push(`**Aliases:** \`${commandHelp.conf.aliases.join(", ")}\``);
                if (commandHelp.help.detailedUsage) helpFields.push(`**Detailed usage**:\n ${commandHelp.help.detailedUsage.replace(/\{prefix\}/gim, prefix)}`);
                if (commandHelp.shortcut) {
                    let keys = Array.from(commandHelp.shortcut.triggers.keys());
                    helpFields.push("**Shortcuts:**\n" + keys.map(k => `\`${k}\` ${commandHelp.shortcut.triggers.get(k).help.replace(/\{prefix\}/gim, prefix)}`).join('\n\n'));
                }
                resolve(await message.channel.createMessage(`${commandHelp.help.description}\n**Usage Example:**\n\`${prefix + commandHelp.help.usage}\`\n**Category:** \`${commandHelp.help.category}\`\n${helpFields.join("\n")}`));
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new Help();