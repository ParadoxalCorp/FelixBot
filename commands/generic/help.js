'use strict';

const Command = require('../../util/helpers/Command');

class Help extends Command {
    constructor() {
        super();
        this.help = {
            name: 'help',
            category: 'generic',
            description: 'Display the list of available commands or get more details on a specific command.\n\nYou can use the `--noEmbed` and `--dm` options to respectively send the help without embed and send it in your direct messages. Like `{prefix} help --noEmbed`, note that those options are case-insensitive and can be combined',
            usage: '{prefix} help'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ['halp'],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args, guildEntry) {
        const noEmbed = new RegExp(/--noEmbed/gim).test(args.join(" "));
        const dm = new RegExp(/--dm/gim).test(args.join(" "));
        //If a command name is specified (ignore arguments), get this command help, otherwise get the general help
        let helpMessage = !args.filter(a => !a.startsWith('--'))[0] ? this.getOverallHelp(client, message, guildEntry) : this.getCommandHelp(client, message, args, guildEntry);

        if (!helpMessage) {
            return;
        }

        if (dm) {
            message.author.getDMChannel().then(channel => {
                channel.createMessage(noEmbed ? helpMessage.normalMessage : helpMessage.embedMessage)
                    .catch(() => {
                        return message.channel.createMessage(`:x: I couldn't send you a direct message, you might have your DMs disabled. You should in this case enable them if you want me to send you a direct message.`);
                    });
            });
        } else {
            return message.channel.createMessage(noEmbed ? helpMessage.normalMessage : helpMessage.embedMessage);
        }
    }

    getOverallHelp(client, message, guildEntry) {
            const categories = [];

            client.commands.forEach(c => {
                if (!categories.includes(c.help.category) && (client.config.admins.includes(message.author.id) || c.help.category !== "admin")) {
                    categories.push(c.help.category);
                }
            });

            return {
                embedMessage: {
                    embed: {
                        title: ":book: Available commands",
                        description: `Here is the list of all available commands and their categories, you can use commands like \`${guildEntry && guildEntry.prefix ? guildEntry.prefix : client.config.prefix} <command>\``,
                        fields: categories.map(c => {
                            return {
                                name: c,
                                value: client.commands.filter(command => command.help.category === c).map(command => `\`${command.help.name}\``).join(" "),
                                inline: false
                            };
                        }),
                        footer: {
                            text: `For a total of ${client.commands.size} commands`
                        },
                        color: client.config.options.embedColor
                    }
                },
                normalMessage: `Here is the list of all available commands and their categories, you can use commands like \`${guildEntry && guildEntry.prefix ? guildEntry.prefix : client.config.prefix} <command>\`\n\n${categories.map(c => '**' + c + '** =>' + client.commands.filter(command => command.help.category === c).map(command => '\`' + command.help.name + '\`').join(', ')).join('\n\n')}`
        };
    }

    getCommandHelp(client, message, args, guildEntry) {
        const commandName = args.filter(a => !a.startsWith('--'))[0];
        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
        if (!command) {
            return false;
        }
        
        return {
            embedMessage: this.getEmbedCommandHelp(client, message, args, command, guildEntry),
            normalMessage: this.getNormalCommandHelp(client, message, args, command, guildEntry)
        };
    }

    getEmbedCommandHelp(client, message, args, command, guildEntry) {
        const embedFields = [{
            name: 'Category',
            value: command.help.category,
            inline: true
        }, {
            name: 'Usage',
            value: '`' + command.help.usage.replace(/{prefix}/gim, guildEntry && guildEntry.prefix ? guildEntry.prefix : client.config.prefix) + '`',
            inline: true
        }];
        if (command.help.params) {
            let paramsList = "";
            for (const key in command.help.params) {
                if (typeof command.help.params[key] === "string") {
                    paramsList += `\`${key}\`: ${command.help.params[key]}\n\n`;
                } else {
                    paramsList += `\`${key}\`: ${command.help.params[key].description}\n**=>Possible values:** (${command.help.params[key].mandatoryValue ?  'A value is mandatory' : 'The value isn\'t mandatory'})\n`;
                    for (const element of command.help.params[key].values) {
                        paramsList += `==>\`${element.name}\`: ${element.description}\n`;
                    }
                    paramsList += "\n"; //Bonus new-line
                }
            }
            embedFields.push({
                name: 'Parameters',
                value: paramsList
            });
        }
        if (command.conf.aliases[0]) {
            embedFields.push({
                name: 'Aliases',
                value: command.conf.aliases.map(a => `\`${a}\``).join(" ")
            });
        }
        if (command.conf.requirePerms[0]) {
            embedFields.push({
                name: 'Require permissions',
                value: command.conf.requirePerms.map(p => `\`${p}\``).join(" "),
                inline: true
            });
        }
        return {
            embed: {
                title: `:book: Help for the ${command.help.name} command`,
                description: command.help.description.replace(/{prefix}/gim, guildEntry && guildEntry.prefix ? guildEntry.prefix : client.config.prefix),
                fields: embedFields,
                color: client.config.options.embedColor
            }
        };
    }

    getNormalCommandHelp(client, message, args, command, guildEntry) {
        //Focusing highly on readability here, one-lining this would look like hell
        let normalHelp = `**Description**: ${command.help.description.replace(/{prefix}/gim, guildEntry && guildEntry.prefix ? guildEntry.prefix : client.config.prefix)}\n`;
        normalHelp += `**Category**: ${command.help.category}\n`;
        normalHelp += `**Usage**: \`${command.help.usage.replace(/{prefix}/gim, guildEntry && guildEntry.prefix ? guildEntry.prefix : client.config.prefix)}\`\n`;
        if (command.conf.aliases[0]) {
            normalHelp += `**Aliases**: ${command.conf.aliases.map(a => '\`' + a + '\`').join(', ')}\n`;
        }
        if (command.conf.requirePerms) {
            normalHelp += `**Require permissions**: ${command.conf.requirePerms.map(p => '\`' + p + '\`').join(', ')}\n`;
        }
        if (command.help.params) {
            for (const key in command.help.params) {
                if (typeof command.help.params[key] === "string") {
                    normalHelp += `\`${key}\`: ${command.help.params[key]}\n\n`;
                } else {
                    normalHelp += `\`${key}\`: ${command.help.params[key].description}\n**=>Possible values:** (${command.help.params[key].mandatoryValue ?  'A value is mandatory' : 'The value isn\'t mandatory'})\n`;
                    for (const element of command.help.params[key].values) {
                        normalHelp += `==>\`${element.name}\`: ${element.description}\n`;
                    }
                    normalHelp += "\n"; //Bonus new-line
                }
            }
        }
        
        return normalHelp;
    }
}

module.exports = new Help();