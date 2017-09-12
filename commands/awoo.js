const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            fetch: {
                await unirest.get("https://api.weeb.sh/images/random?type=awoo")
                .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                .end(async function(result) {
                    var users = await client.getUserResolvable(message, {
                        guildOnly: true
                    });
                    if (!result.body || !result.body.url) return resolve(await message.channel.send(":x: An error occured :v"));
                    var awooUrl = result.body.url;
                    resolve(await message.channel.send({
                        embed: {
                            image: {
                                url: awooUrl
                            },
                            footer: {
                                text: `Powered by https://weeb.sh/`
                            }
                        }
                    }));

                });
            }
        }
        catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'awoo',
    description: 'awoo someone',
    usage: 'awoo user resolvable',
    category: 'image'
};