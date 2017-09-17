const fs = require("fs-extra");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/);
            args.shift();
            client.database.version = args.join(" ");
            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                if (err) console.error(err)
            });
            if (!args[0]) return resolve(await message.channel.send(':x: You ducking scrub thought you could set the version to nothing? Eh? Eh?'));
            const changelogs = client.clientData.get("changelogs");
            changelogs.version = args.join(" ");
            client.clientData.set("changelogs", changelogs);
            resolve(await message.channel.send(":white_check_mark: Alright, the version has been set to `" + args.join(" ") + "`"));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false,
    permLevel: 42
};

exports.help = {
    name: 'setversion',
    description: 'Set the version of the bot',
    usage: 'setversion 9.9.9',
    category: 'admin'
};