const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let result = await client.request("https://api.weeb.sh/images/random?type=awoo", { header: 'Authorization', value: `Bearer ${client.database.wolkeImageKey}` })
            if (!result.body || !result.body.url) return resolve(await message.channel.send(":x: An error occurred :v"));
            resolve(await message.channel.send({
                embed: {
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
    disabled: false,
};

exports.help = {
    name: 'awoo',
    description: 'awoo someone',
    usage: 'awoo user resolvable',
    category: 'image'
};