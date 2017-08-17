const unirest = require("unirest");

exports.run = async(client, message) => {
    try {
        const whitespace = message.content.includes(" ");
        if (!whitespace) {
            await unirest.get("https://staging.weeb.sh/images/types")
                .header(`Authorization`, `Bearer ${client.database.Data.global[0].wolkeImageKey}`)
                .end(async function (result) {
                    const types = result.body.types;
                    if (!types) {
                        return await message.channel.send(":x: Awh, seems like something went wrong D:");
                    }
                    var i = 1;
                    client.awaitReply(message, ":gear: Image parameter", "Hoi, welcome to the weeb's image central :wave: ! Select the image type you want by either typing the number or the name of a type\n" + types.map(t => `\`(${i++})${t}\``).join(", ")).then(async(reply) => {
                        if (!reply) {
                            return await message.channel.send(":x: Command aborted");
                        }
                        if (typeof Number(reply.reply.content) !== "number" && !types.includes(reply)) {
                            return await message.channel.send(":x: That type does not exist");
                        } else if (reply.reply.content > types.length || reply.reply.content < 1) {
                            return await message.channel.send(":x: The number you specified is not valid");
                        }
                        var type;
                        if (typeof types[reply.reply.content] === "undefined") {
                            if (!types.includes(reply.reply.content)) {
                                return await message.channel.send(":x: That type does not exist");
                            }
                            type = reply.reply.content;
                        } else {
                            type = types[reply.reply.content - 1];
                        }
                        if (message.guild) {
                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                await reply.reply.delete();
                            }
                        }
                        await reply.question.delete();
                        await unirest.get(`https://staging.weeb.sh/images/random?type=${type}`)
                            .header(`Authorization`, `Bearer ${client.database.Data.global[0].wolkeImageKey}`)
                            .end(async function (image) {
                                if (image.body.status === 404) {
                                    return await message.channel.send(":x: No image found :v");
                                }
                                if (image.body.url) {
                                    return await message.channel.send(image.body.url);
                                }
                            })
                    })
                });
        } else {
            var type = message.content.substr(message.content.indexOf(" ") + 1).trim();
            await unirest.get("https://staging.weeb.sh/images/types")
                .header(`Authorization`, `Bearer ${client.database.Data.global[0].wolkeImageKey}`)
                .end(async function (result) {
                    const types = result.body.types;
                    if (!types) {
                        return await message.channel.send(":x: Awh, seems like something went wrong D:");
                    }
                    if (!types.includes(type)) {
                        var splitContent = message.content.split(" ");
                        var cleanType = splitContent.shift();
                        if (types.includes(splitContent[0])) {
                            type = splitContent[0];
                        } else {
                            return await message.channel.send(":x: The image type you specified does not exist");
                        }
                    }
                    await unirest.get(`https://staging.weeb.sh/images/random?type=${type}`)
                        .header(`Authorization`, `Bearer ${client.database.Data.global[0].wolkeImageKey}`)
                        .end(async function (image) {
                            if (image.body.status === 404) {
                                return await message.channel.send(":x: No image found :v");
                            }
                            if (image.body.url) {
                                return await message.channel.send(image.body.url);
                            }
                        })
                });
        }
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
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
