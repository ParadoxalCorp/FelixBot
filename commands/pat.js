const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let result = await client.request("https://api.weeb.sh/images/random?type=pat&filetype=gif", { header: 'Authorization', value: `Bearer ${client.database.wolkeImageKey}` });
            let users = await message.getUserResolvable();
            if (!result.body || !result.body.url) return resolve(await message.channel.send(":x: An error occurred :v"));
            resolve(await message.channel.send({
                embed: {
                    description: users.first() ? `Hey ${users.map(u => '**' + u.tag + '**').join(", ")}, you just received a pat from **${message.author.tag}**` : "",
                    image: {
                        url: result.body.url
                    },
                    footer: {
                        text: `Powered by https://weeb.sh/`
                    }
                }
            }));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'pat',
    description: 'pat someone',
    usage: 'pat user resolvable',
    category: 'image'
};