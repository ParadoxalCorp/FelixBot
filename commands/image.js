const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!client.imageTypes.types) return resolve(await message.channel.send(":x: An error occured :v"));
            let args = message.content.split(/\s+/gim);
            args.shift();
            if (args.length < 1) {
                var i = 1;
                const reply = await client.awaitReply({
                    message: message,
                    title: ":gear: Image parameter",
                    question: "Hoi, welcome to the weeb's image central :wave: ! Select the image type you want by either typing the number or the name of a type\n" + client.imageTypes.types.map(t => `\`(${i++})${t}\``).join(", ")
                });
                if (!reply) {
                    return resolve(await message.channel.send(":x: Command aborted"));
                }
                if (isNaN(reply.reply.content) && !client.imageTypes.types.includes(reply)) {
                    return resolve(await message.channel.send(":x: That type does not exist"));
                } else if (reply.reply.content > client.imageTypes.types.length || reply.reply.content < 1) {
                    return resolve(await message.channel.send(":x: The number you specified is not valid"));
                }
                var type;
                if (typeof client.imageTypes.types[reply.reply.content - 1] === "undefined") {
                    if (!client.imageTypes.types.includes(reply.reply.content)) {
                        return resolve(await message.channel.send(":x: That type does not exist"));
                    }
                    type = reply.reply.content;
                } else {
                    type = client.imageTypes.types[reply.reply.content - 1];
                }
                if (message.guild) {
                    if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await reply.reply.delete();
                    }
                }
                await reply.question.delete();
                await unirest.get(`https://api.weeb.sh/images/random?type=${type}`)
                    .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                    .end(async function(image) {
                        if (!image.body || !image.body.url) {
                            return resolve(await message.channel.send(":x: No image found :v"));
                        }
                        return resolve(await message.channel.send({
                            embed: {
                                image: {
                                    url: image.body.url
                                },
                                footer: {
                                    text: `Powered by https://weeb.sh/`
                                }
                            }
                        }));
                    });
            } else {
                var type = args[0];
                if (!client.imageTypes.types.includes(type)) {
                    return resolve(await message.channel.send(":x: The image type you specified does not exist"));
                }
                await unirest.get(`https://api.weeb.sh/images/random?type=${type}`)
                    .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                    .end(async function(image) {
                        if (!image.body || !image.body.url) {
                            return resolve(await message.channel.send(":x: No image found :v"));
                        }
                        return resolve(await message.channel.send({
                            embed: {
                                image: {
                                    url: image.body.url
                                },
                                footer: {
                                    text: `Powered by https://weeb.sh/`
                                }
                            }
                        }));
                    });
            }
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: ["img"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'image',
    description: 'Get random images from the weeb\'s images api',
    usage: 'image',
    category: 'image',
    detailledUsage: '\n`{prefix}image` Will return a list of available images types where you can select from\n`{prefix}image owo` Will return a random image from the **owo** image type'
};