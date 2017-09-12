const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            fetch: {
                await unirest.get("https://api.weeb.sh/images/random?type=slap")
                .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                .end(async function(result) {
                    var users = await client.getUserResolvable(message, {
                        guildOnly: true
                    });
                    if (!result.body || !result.body.url) return resolve(await message.channel.send(":x: An error occured :v"));
                    var slapUrl = result.body.url;
                    if (users.get(message.author.id)) users.delete(message.author.id); //Remove the author from the users 
                    if (users.size > 0) {
                        resolve(await message.channel.send({
                            embed: {
                                description: `Hey ${users.map(u => u.toString()).join(", ")}, you just received a slap from ${message.author.toString()}`,
                                image: {
                                    url: slapUrl
                                },
                                footer: {
                                    text: `Powered by https://weeb.sh/`
                                }
                            }
                        }));
                    } else {
                        resolve(await message.channel.send({
                            embed: {
                                image: {
                                    url: slapUrl
                                },
                                footer: {
                                    text: `Powered by https://weeb.sh/`
                                }
                            }
                        }));
                    }
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
    name: 'slap',
    description: 'slap someone',
    usage: 'slap user resolvable',
    category: 'image'
};