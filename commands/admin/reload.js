'use strict';

const Command = require('../../util/helpers/Command');

class Reload extends Command {
    constructor() {
        super();
        this.help = {
            name: 'reload',
            category: 'admin',
            description: 'Reload a module - This command use a command-line like syntax for its parameters, as in, parameters looks like `--<parameter_name>`. Parameters can have a value, the syntax for specifying a value for a parameter is `--<parameter_name>=<value>`\n\nExample: `{prefix} reload ./module.js --module --bindToClient=moduleBaguette --instantiate`\nThe above example reload the file `module.js` at the root of this command\'s folder, instantiate it without additional parameters and add it as a propriety of the client class under the name `moduleBaguette`',
            usage: '{prefix} reload <file_path> <params>',
            params: {
                '--event': 'Specify that the file you want to reload is an event listener',
                '--command': 'Specify that the file you want to reload is a command, unless the command isn\'t added yet, a path is usually not needed and the command name can be provided instead',
                '--module': 'Specify that the file you want to reload is a module, permit the use of the `--bindToClient` and `--instantiate` parameters',
                '--bindToClient': {
                    description: 'Specify that the file should be added as a property of the client class',
                    mandatoryValue: false,
                    values: [{
                        name: '<name>',
                        description: 'Specify the name under which the file should be added as a property of the client class'
                    }]
                },
                '--instantiate': {
                    description: 'This specify that the command should expect a non-instantiated class that should be instantiated',
                    mandatoryValue: false,
                    values: [{
                        name: 'client',
                        description: 'Specify that the class should be instantiated with the client'
                    }, {
                        name: 'bot',
                        description: 'Specify that the class should be instantiated with the bot instance'
                    }]
                }
            }
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
            parsedArgs[arg.split('--')[1].split('=')[0].toLowerCase()] = arg.includes('=') ? arg.split('=')[1] : true;
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

        if (client[typeof parsedArgs['bindtoclient'] === 'string' ? parsedArgs['bindtoclient'] : moduleName]) {
            delete client[moduleName];
            parsedArgs['bindtoclient'] = true;
        }

        const actualModule = parsedArgs['instantiate'] ? new(require(args[0]))(parsedArgs['instantiate'] === 'client' ?
            client : (parsedArgs['instantiate'] === 'bot' ? client.bot : false)) : require(args[0]);

        if (parsedArgs['bindtoclient']) {
            client[typeof parsedArgs['bindtoclient'] === 'string' ? parsedArgs['bindtoclient'] : moduleName] = actualModule;
        }

        return moduleName;
    }
}

module.exports = new Reload();