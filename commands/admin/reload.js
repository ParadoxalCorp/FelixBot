'use strict';

const Command = require('../../util/helpers/Command');

class Reload extends Command {
    constructor() {
        super();
        this.help = {
            name: 'reload',
            category: 'admin',
            description: 'Reload a module',
            usage: '{prefix} reload <file_path> <opts>'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false
        };
    }

    async run(client, message, args) {
        if (!args[0]) {
            return message.channel.createMessage('Come on scrub at least give me the name of the command to reload');
        }
        if (args.includes('--event')) {
            const reloadedEvent = this.reloadEventListener(client, args);
            return message.channel.createMessage(`:white_check_mark: Successfully reloaded/added the \`${reloadedEvent}\` event listener`);
        } else if (args.includes('--command')) {
            const reloadedCommand = this.reloadCommand(client, args);
            return message.channel.createMessage(`:white_check_mark: Successfully reloaded/added the command \`${reloadedCommand}\``);
        } else if (args.includes('--module')) {
            const reloadedModule = this.reloadModule(client, args);
            return message.channel.createMessage(`:white_check_mark: Successfully reloaded/added the module ${reloadedModule}`);
        }
        return message.channel.createMessage(`Hoi, this is not valid syntax, try again kthx`);
    }

    reloadEventListener(client, args) {
        const eventName = args[0].split(/\/|\\/gm)[args[0].split(/\/|\\/gm).length - 1].split('.')[0];
        delete require.cache[require.resolve(args[0])];
        client.bot.removeAllListeners(eventName);
        client.bot.on(eventName, require(args[0]).bind(null, client));
        return eventName;
    }

    parseArguments(args) {
        const parsedArgs = {};
        args.forEach(arg => {
            if (!arg.includes('--')) {
                return;
            }
            parsedArgs[arg.split('--')[1].split('=')[0]] = arg.includes('=') ? arg.split('=')[1] : true;
        });
        return parsedArgs;
    }

    reloadCommand(client, args) {
        const isPath = new RegExp(/\/|\\/gim).test(args[0]);
        delete require.cache[require.resolve(isPath ? args[0] : `../${client.commands.get(args[0]).help.category}/${client.commands.get(args[0]).help.name}`)];
        const command = require(isPath ? args[0] : `../${client.commands.get(args[0]).help.category}/${client.commands.get(args[0]).help.name}`);

        if ((!client.database || !client.database.healthy) && command.conf.requireDB) {
            command.conf.disabled = ":x: This command uses the database, however the database seems unavailable at the moment";
        }

        client.commands.set(command.help.name, command);
        command.conf.aliases.forEach(alias => {
            client.aliases.set(alias, command.help.name);
        });

        return command.help.name;
    }

    reloadModule(client, args) {
        const parsedArgs = this.parseArguments(args);
        const moduleName = args[0].split(/\/|\\/gm)[args[0].split(/\/|\\/gm).length - 1].split('.')[0];
        delete require.cache[require.resolve(args[0])];

        if (client[typeof parsedArgs['bindToClient'] === 'string' ? parsedArgs['bindToClient'] : moduleName]) {
            delete client[moduleName];
            parsedArgs['bindToClient'] = true;
        }

        const actualModule = parsedArgs['instantiate'] ? new(require(args[0]))(parsedArgs['instantiate'] === 'client' ?
            client : (parsedArgs['instantiate'] === 'bot' ? client.bot : false)) : require(args[0]);

        if (parsedArgs['bindToClient']) {
            client[typeof parsedArgs['bindToClient'] === 'string' ? parsedArgs['bindToClient'] : moduleName] = actualModule;
        }

        return moduleName;
    }
}

module.exports = new Reload();