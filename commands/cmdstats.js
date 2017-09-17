exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/);
            args.shift();
            if (!args[0]) {
                let categories = [];
                client.commands.map(function(c) {
                    let thisCategory = categories.findIndex(function(element) {
                        return element.name === c.help.category
                    });
                    if (thisCategory === -1) {
                        categories.push({
                            name: c.help.category,
                            uses: c.uses
                        });
                    } else {
                        categories[thisCategory].uses = categories[thisCategory].uses + c.uses;
                    }
                });
                resolve(await message.channel.send({
                    embed: {
                        title: 'Commands categories usage statistics',
                        description: '```\n' + categories.map(c => `${c.name}: ${c.uses}`).join('\n') + '```',
                        footer: {
                            text: `For a total of ${client.cmdsUsed} commands used`
                        }
                    }
                }));
            } else {
                if (!client.commands.filter(c => c.help.category === args[0]).size) return resolve(await message.channel.send(':x: Invalid category name'));
                resolve(await message.channel.send({
                    embed: {
                        title: `${args[0]}'s commands usage statistics`,
                        description: '```\n' + client.commands.filter(c => c.help.category === args[0]).map(c => `${c.help.name}: ${c.uses}`).join('\n') + '```',
                        footer: {
                            text: `For a total of ${client.cmdsUsed} commands used`
                        }
                    }
                }));
            }
        } catch (err) {
            client.emit('commandFail', message, err);
        }
    })
}

exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false,
    permLevel: 42
};

exports.help = {
    name: 'cmdstats',
    description: 'Get the stats of the commands usage, resetted every restart',
    usage: 'cmdstats',
    category: 'admin'
};