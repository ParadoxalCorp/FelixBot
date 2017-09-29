const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            fetch: {
                await unirest.get("https://api.weeb.sh/images/random?type=cuddle&filetype=gif")
                .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                .end(async function(result) {
                    var users = await client.getUserResolvable(message, {
                        guildOnly: true
                    });
                    if (!result.body || !result.body.url) return resolve(await message.channel.send(":x: An error occurred :v"));
                    var cuddleUrl = result.body.url;
                    if (users.get(message.author.id)) users.delete(message.author.id); //Remove the author from the users 
                    if (users.size > 0) {
                        resolve(await message.channel.send({
                            embed: {
                                description: `Hey ${users.map(u => '**' + u.tag + '**').join(", ")}, you've just been cuddled by **${message.author.tag}**`,
                                image: {
                                    url: cuddleUrl
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
                                    url: cuddleUrl
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
    disabled: false
};

exports.help = {
    name: 'cuddle',
    description: 'cuddle someone',
    usage: 'cuddle user resolvable',
    category: 'image'
};