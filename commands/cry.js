const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            fetch: {
                await unirest.get("https://api.weeb.sh/images/random?type=cry&filetype=gif")
                .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                .end(async function(result) {
                    var users = await client.getUserResolvable(message, {
                        guildOnly: true
                    });
                    if (!result.body || !result.body.url) return resolve(await message.channel.send(":x: An error occured :v"));
                    var cryUrl = result.body.url;
                    resolve(await message.channel.send({
                        embed: {
                            image: {
                                url: cryUrl
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
    name: 'cry',
    description: 'cry someone',
    usage: 'cry user resolvable',
    category: 'image'
};