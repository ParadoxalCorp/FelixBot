exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        let args = message.content.split(/\s+/gim);
        args.shift();
        if (!args.length) return resolve(await message.channel.send(":x: No parameters provided"));
        let command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
        if (!command) {
            try {
                let cmd = require(`./${args[0]}`);
                client.commands.set(args[0], cmd);
                cmd.conf.aliases.forEach(alias => {
                    client.aliases.set(alias, cmd.help.name);
                });
                return resolve(await message.channel.send(`:white_check_mark: Successfully added the \`${args[0]}\` command`));
            } catch (err) {
                console.error(err);
                return resolve(await message.channel.send(":x: Invalid command"));
            }
        }
        command = command.help.name;
        try {
            await delete require.cache[require.resolve(`./${command}.js`)];
            let cmd = require(`./${command}`);
            let thisUses = client.commands.get(command).uses; //Save the uses count
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            cmd.uses = thisUses;
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            let shortcutsReloaded = "";
            if (cmd.shortcut) {
                let i = 0;
                const readdir = require("fs-extra").readdir;
                let cmdShortcuts = await readdir(`./modules/shortcuts/${cmd.help.name}`);
                cmdShortcuts.forEach(async(s) => {
                    delete require.cache[require.resolve(`../modules/shortcuts/${cmd.help.name}/${s}`)];
                    let shortcut = require(`../modules/shortcuts/${cmd.help.name}/${s}`);
                    i++;
                });
                shortcutsReloaded = `and ${i} shortcuts have been reloaded out of ${cmdShortcuts.length}`;
            }
            resolve(await message.channel.send(`:white_check_mark: \`${command}\` has been reloaded ${shortcutsReloaded}`))
        } catch (err) {
            console.error(err);
            reject(await message.channel.send(":x: An error occurred, logged the stuff to the console fam"));
        }
    });
}
exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'reload',
    description: 'Reloads a command that\'s been modified or all commands and all modules',
    usage: 'reload command',
    category: 'admin'
};