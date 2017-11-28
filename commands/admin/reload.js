const fs = require('fs-extra');

class Reload {
    constructor() {
        this.help = {
            name: 'reload',
            usage: 'reload [file_path]',
            description: 'Reload (aka delete the cache and require) the file at the specified path. Note: If a command, dont forget that the path will be something like ../category/command_name'
        };
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Welp if you don't tell me what to reload i can't reload anything`));
                let commandsStats = client.clientData.get("commandsStats");
                let path = args[0];
                let command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
                //Tbh fuck fs
                function exists(path) {
                    try {
                        require.resolve(path);
                        return true;
                    } catch (err) {
                        return false;
                    }
                }

                if (command || (exists(path) && require(path).help)) {
                    if (command && command.subcommand) return resolve(await message.channel.send(`:x: \`${command.help.name}\` is a subcommand and therefore cannot be reloaded`));
                    if (command) path = `../${command.help.category}/${command.help.name}`;
                    let thisUses = command ? command.uses : 0;
                    try {
                        await delete require.cache[require.resolve(path)];
                        let newCommand = require(path);
                        if (command) {
                            client.commands.delete(command.help.name);
                            client.aliases.forEach((cmd, alias) => {
                                if (cmd === command.help.name) client.aliases.delete(alias);
                            });
                        }
                        newCommand.uses = thisUses;
                        if (!commandsStats[newCommand.help.name]) commandsStats[newCommand.help.name] = 0;
                        client.clientData.set("commandsStats", commandsStats);
                        //Set default conf if no conf provided
                        if (!newCommand.conf) newCommand.conf = { guildOnly: false, disabled: false, aliases: false, cooldownWeight: 5 };
                        newCommand.conf.guildOnly = newCommand.conf.guildOnly ? newCommand.conf.guildOnly : false;
                        newCommand.conf.aliases = newCommand.conf.aliases ? newCommand.conf.aliases : false;
                        newCommand.conf.disabled = newCommand.conf.disabled ? newCommand.conf.disabled : false;
                        if (!newCommand.conf.cooldownWeight) newCommand.conf.cooldownWeight = 5;
                        if (!newCommand.help.category) newCommand.help.category = path.split(/\\|\//gim)[1];
                        //Add the command to the collection
                        client.commands.set(newCommand.help.name, newCommand);
                        if (newCommand.conf && newCommand.conf.aliases) newCommand.conf.aliases.forEach(alias => {
                            client.aliases.set(alias, newCommand.help.name);
                        });
                        let shortcutsReloaded = "";
                        if (newCommand.shortcut) {
                            let i = 0;
                            const readdir = require("fs-extra").readdir;
                            let cmdShortcuts = await fs.readdir(`./util/shortcuts/${newCommand.help.name}`);
                            cmdShortcuts.forEach(async(s) => {
                                delete require.cache[require.resolve(`../../util/shortcuts/${newCommand.help.name}/${s}`)];
                                let shortcut = require(`../../util/shortcuts/${newCommand.help.name}/${s}`);
                                i++;
                            });
                            shortcutsReloaded = `and ${i} shortcuts have been reloaded out of ${cmdShortcuts.length}`;
                        }
                        resolve(await message.channel.createMessage(`:white_check_mark: The command \`${newCommand.help.name}\` has successfully been ${command ? "reloaded" : "added"} ${shortcutsReloaded}`));
                    } catch (err) {
                        resolve(message.channel.createMessage({
                            embed: {
                                description: `:x: Something went wrong: \`\`\`js\n${err.stack}\`\`\``
                            }
                        }));
                    }
                } else {
                    try {
                        //Specific reload for events since it needs to be bind and the listener has to be removed
                        await delete require.cache[require.resolve(path)];
                        if (path.includes("events")) {
                            let newEvent = require(path);
                            let event = path.split(`/`);
                            event = event[event.length - 1].split(".")[0];
                            client.removeAllListeners(event);
                            client.on(event, newEvent.bind(null, client));
                            resolve(await message.channel.createMessage(`:white_check_mark: The event \`${event}\` has successfully been reloaded/added`));
                        } else {
                            require(path);
                            resolve(await message.channel.createMessage(`:white_check_mark: The file \`${path}\` has successfully been reloaded/added`));
                        }
                    } catch (err) {
                        resolve(message.channel.createMessage({
                            embed: {
                                description: `:x: Something went wrong: \`\`\`js\n${err}\`\`\``
                            }
                        }));
                    }
                }
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new Reload();