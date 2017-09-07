exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        let args = message.content.split(/\s+/gim);
        args.shift();
        if (!args.length) return resolve(await message.channel.send(":x: No parameters provided"));
        let command = client.commands.get(args[0]) || client.aliases.get(args[0]);
        if (!command) return resolve(await message.channel.send(":x: Invalid command"));
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
            return resolve(await message.channel.send(`:white_check_mark: \`${command}\` has been reloaded`))
        } catch (err) {
            console.error(err);
            return reject(await message.channel.send(":x: An error occured, logged the stuff to the console fam"));
        }
    });
}
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    disabled: false,
    permLevel: 42
};

exports.help = {
    name: 'reload',
    description: 'Reloads a command that\'s been modified or all commands and all modules',
    usage: 'reload command',
    category: 'admin'
};