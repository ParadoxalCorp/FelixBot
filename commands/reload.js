const fs = require('fs-extra');

class Reload {
    constructor() {
        this.help = {
            name: 'reload',
            category: 'admin',
            usage: 'reload [file_path]',
            description: 'Reload (aka delete the cache and require) the file at the specified path. Note: If a command, only the command name or an alias is needed instead of the path'
        };
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) return resolve(client.createMessage(message.channel.id, `:x: Welp if you don't tell me what to reload i can't reload anything`));
                let path = new RegExp(/\/|\\/gim).test(message.content) ? args[0] : `./${args[0]}`;
                let command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
                if (command || fs.existsSync(`./${args[0]}`)) {
                    if (command) path = `./${command.help.name}`;
                    let thisUses = command ? command.uses : 0;
                    try {
                        await delete require.cache[require.resolve(path)];
                        let newCommand = require(path);
                        client.commands.delete(command.help.name);
                        client.aliases.forEach((cmd, alias) => {
                            if (cmd === command.help.name) client.aliases.delete(alias);
                        });
                        newCommand.uses = thisUses;
                        //Set default conf if no conf provided
                        if (!newCommand.conf) newCommand.conf = { guildOnly: false, disabled: false, aliases: false }
                        newCommand.conf.guildOnly = newCommand.conf.guildOnly ? newCommand.conf.guildOnly : false;
                        newCommand.conf.aliases = newCommand.conf.aliases ? newCommand.conf.aliases : false;
                        newCommand.conf.disabled = newCommand.conf.disabled ? newCommand.conf.disabled : false;
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
                                delete require.cache[require.resolve(`../util/shortcuts/${newCommand.help.name}/${s}`)];
                                let shortcut = require(`../modules/util/${newCommand.help.name}/${s}`);
                                i++;
                            });
                            shortcutsReloaded = `and ${i} shortcuts have been reloaded out of ${cmdShortcuts.length}`;
                        }
                        resolve(await client.createMessage(message.channel.id, `:white_check_mark: The command \`${newCommand.help.name}\` has successfully been ${command ? "reloaded" : "added"} ${shortcutsReloaded}`));
                    } catch (err) {
                        resolve(client.createMessage(message.channel.id, {
                            embed: {
                                description: `:x: Something went wrong: \`\`\`js\n${err}\`\`\``
                            }
                        }));
                    }
                } else {
                    try {
                        await delete require.cache[require.resolve(path)];
                        require(path);
                        resolve(await client.createMessage(message.channel.id, `:white_check_mark: The file \`${path}\` has successfully been reloaded/added`));
                    } catch (err) {
                        resolve(client.createMessage(message.channel.id, {
                            embed: {
                                description: `:x: Something went wrong: \`\`\`js\n${err}\`\`\``
                            }
                        }));
                    }
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Reload();