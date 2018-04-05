'use strict';

const Command = require('../../util/helpers/Command');

class Help extends Command {
    constructor() {
        super();
        this.help = {
            name: 'help',
            category: 'generic',
            description: 'pong',
            usage: '{prefix} help'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ['halp'],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false
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
                        color: 0x3498db
                    }
                },
                normalMessage: `Here is the list of all available commands and their categories, you can use commands like \`${guildEntry && guildEntry.prefix ? guildEntry.prefix : client.config.prefix} <command>\`\n\n${categories.map(c => '**' + c + '** =>' + client.commands.filter(command => command.help.category === c).map(command => '\`' + command.help.name + '\`').join(', ')).join('\n\n')}`
        };
    }

    getCommandHelp(client, message, args) {
        const commandName = args.filter(a => !a.startsWith('--'))[0];
        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
        if (!command) {
            return false;
        } 
        //TODO (gave me a headache :c)
    }
}

module.exports = new Help();