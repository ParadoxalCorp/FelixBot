'use strict';

const Command = require('../../util/helpers/modules/Command');
const { inspect } = require('util');

class Reload extends Command {
    constructor() {
        super();
        this.help = {
            name: 'reload',
            category: 'admin',
            description: 'Reload a module - This command use a command-line like syntax for its parameters, as in, parameters looks like `--<parameter_name>`. Parameters can have a value, the syntax for specifying a value for a parameter is `--<parameter_name>=<value>`\n\nExample: `reload ./module.js --module --bindToClient=moduleBaguette --instantiate`\nThe above example reload the file `module.js` at the root of this command\'s folder, instantiate it without additional parameters and add it as a propriety of the client class under the name `moduleBaguette`',
            usage: '{prefix}reload <file_path> <params>',
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
                    mandatoryValue: true,
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
            ownerOnly: false,
            expectedArgs: [{
                description: 'Please specify the path of the file you want to reload/add, or, if a command that is already loaded, the name of the command. Input `all` if you want to reload all commands/modules/events listeners',
            }, {
                description: 'Please specify the type of the file you want to reload, can be either `event`, `command` or `module`',
                possibleValues: [{
                    name: 'command',
                    interpretAs: '--command'
                }, {
                    name: 'event',
                    interpretAs: '--event'
                }, {
                    name: 'module',
                    interpretAs: '--module'
                }]
            }, {
                //Conditional branch
                description: 'Please specify if a non-instantiated class should be expected from this module, and with what it should be instantiated. Can be either `bot`, `client` or `no` to not instantiate it',
                condition: (client, message, args) => args.includes('--module') && !args.includes('all'),
                possibleValues: [{
                    name: 'bot',
                    interpretAs: '--instantiate=bot',
                }, {
                    name: 'client',
                    interpretAs: '--instantiate=client'
                }, {
                    name: 'no',
                    interpretAs: false
                }]
            }, {
                //Conditional branch
                description: 'Please specify whether the module should be added as a property of the client class, can be either `yes`, `<name>` or `no`. Where `<name>` is the name under which the property should be added, if `yes`, the file name will be used',
                condition: (client, message, args) => args.includes('--module') && !args.includes('all'),
                possibleValues: [{
                    name: 'yes',
                    interpretAs: '--bindtoclient',
                }, {
                    name: '*',
                    interpretAs: '--bindtoclient={value}'
                }, {
                    name: 'no',
                    interpretAs: false
                }]
            }]
        };
    }

    async run(client, message, args) {
        const isPath = new RegExp(/\/|\\/gim).test(args[0]);
        const command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
        const path = args[0] === 'all' || this.verifyPath(args.includes('--command') && !isPath ? `../${command.help.category}/${command.help.name}` : args[0]);
        if (!path) {
            return message.channel.createMessage(':x: Look, i don\'t want to be mean, but this is NOT a valid path, try again');
        }
        const fileName = typeof path === 'string' ? path.split(/\/|\\/gm)[path.split(/\/|\\/gm).length - 1].split('.')[0] : false;

        if (args.includes('--event')) {
            const reloadedEvent = await client.IPCHandler.broadcastReload('event', args[0] === 'all' ? args[0] : path)
                .then(() => {
                    if (args[0] === 'all') {
                        return message.channel.createMessage(`:white_check_mark: Successfully reloaded all events listeners\n\n:warning: Don't forget to reload all modules now, to add back their listeners`);
                    }
                    return message.channel.createMessage(`:white_check_mark: Successfully reloaded/added the \`${fileName}\` event listener\n\n:warning: Don't forget to reload all modules now, to add back their listeners`);
                })
                .catch(err => {
                    return message.channel.createMessage({
                        embed: {
                            description: 'So, at least one cluster reported that the reload failed, here\'s the list scrub ```js\n' + inspect(err, { depth: 2 }) + '```'
                        }
                    });
                });
            return reloadedEvent;
        } else if (args.includes('--command')) {
            if (args[0] !== 'all' && require(path).conf.subCommand) {
                return message.channel.createMessage(`:x: Sorry cutie, but this is a sub-command, so the only way to reload it is to re-generate it`);
            }
            const reloadedCommand = await client.IPCHandler.broadcastReload('command', args[0] === 'all' ? args[0] : path)
                .then(() => {
                    if (args[0] === 'all') {
                        return message.channel.createMessage(':white_check_mark: Successfully reloaded all commands');
                    }
                    return message.channel.createMessage(`:white_check_mark: Successfully reloaded/added the command \`${fileName}\``);
                })
                .catch(err => {
                    return message.channel.createMessage({
                        embed: {
                            description: 'So, at least one clusters reported that the reload failed, here\'s the list scrub ```js\n' + inspect(err, { depth: 2 }) + '```'
                        }
                    });
                });
            return reloadedCommand;
        } else if (args.includes('--module')) {
            const reloadedModule = await client.IPCHandler.broadcastReload('module', args[0] === 'all' ? args[0] : path, fileName, this.parseArguments(args))
                .then(() => {
                    if (args[0] === 'all') {
                        return message.channel.createMessage(':white_check_mark: Successfully reloaded all modules');
                    }
                    return message.channel.createMessage(`:white_check_mark: Successfully reloaded/added the module \`${fileName}\``);
                })
                .catch(err => {
                    return message.channel.createMessage({
                        embed: {
                            description: 'So, at least one clusters reported that the reload failed, here\'s the list scrub ```js\n' + inspect(err, { depth: 2 }) + '```'
                        }
                    });
                });
            return reloadedModule;
        }
        return message.channel.createMessage(`Hoi, this is not valid syntax, try again kthx`);
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

    verifyPath(path) {
        let resolvedPath;
        try {
            resolvedPath = require.resolve(path);
        }
        // eslint-disable-next-line no-empty
        catch (err) {}

        return resolvedPath;
    }
}

module.exports = new Reload();