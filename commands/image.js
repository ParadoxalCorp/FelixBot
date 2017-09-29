const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            //If the first types request failed
            if (!client.imageTypes.types) return resolve(await message.channel.send(":x: An error occurred :v"));
            //Split args into an array
            let args = message.content.split(/\s+/gim);
            args.shift();
            //If no args ask for user input to determine a type
            if (args.length < 1) {
                let i = 1;
                const reply = await client.awaitReply({
                    message: message,
                    title: ":gear: Image parameter",
                    question: "Hoi, welcome to the weeb's image central :wave: ! Select the image type you want by either typing the number or the name of a type\n" + client.imageTypes.types.map(t => `\`(${i++})${t}\``).join(", ")
                });
                //If no reply after 60 secs
                if (!reply.reply) {
                    reply.question.delete();
                    return resolve(await message.channel.send(":x: Command aborted"));
                }
                //Try to resolve to a type
                let type;
                if (!client.imageTypes.types[Math.round(Number(reply.reply.content - 1))]) {
                    if (!client.imageTypes.types.includes(reply.reply.content.trim().toLowerCase())) {
                        let filteredTypes = client.imageTypes.types.filter(t => t.includes(reply.reply.content.trim().toLowerCase()));
                        if (filteredTypes.length) type = filteredTypes[0];
                    } else type = reply.reply.content.trim().toLowerCase();
                } else type = client.imageTypes.types[Math.round(Number(reply.reply.content - 1))];
                //Delete messages and return if type is unresolved
                reply.question.delete();
                if (message.guild && reply.reply.deletable) reply.reply.delete();
                if (!type) return resolve(await message.channel.send(':x: That tag does not exist'));
                //Request the image and return it in an embed
                await unirest.get(`https://api.weeb.sh/images/random?type=${type}`)
                    .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                    .end(async function(image) {
                        if (!image.body || !image.body.url) return resolve(await message.channel.send(":x: No image found :v"));
                        resolve(await message.channel.send({
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
            } else { //If args resolve the arg to a type
                //Resolve to type
                let type;
                if (!client.imageTypes.types.includes(args[0].toLowerCase())) {
                    let filteredTypes = client.imageTypes.types.filter(t => t.includes(args[0].toLowerCase()));
                    if (filteredTypes.length) type = filteredTypes[0];
                } else type = args[0].toLowerCase();
                if (!type) return resolve(await message.channel.send(":x: The image type you specified does not exist"));
                //Request the image and return it in an embed
                await unirest.get(`https://api.weeb.sh/images/random?type=${type}`)
                    .header(`Authorization`, `Bearer ${client.database.wolkeImageKey}`)
                    .end(async function(image) {
                        if (!image.body || !image.body.url) return resolve(await message.channel.send(":x: No image found :v"));
                        resolve(await message.channel.send({
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
    aliases: ["img", "images"],
    disabled: false
};

exports.help = {
    name: 'image',
    description: 'Get random images from the weeb\'s images api',
    usage: 'image',
    category: 'image',
    detailedUsage: '\n`{prefix}image` Will return a list of available images types where you can select from\n`{prefix}image owo` Will return a random image from the **owo** image type'
};