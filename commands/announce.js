exports.run = async(client, message) => {
    try {
        client.awaitReply(message, ":gear: Announcement parameter:", "What's the title of this announcement? Answer with `none` to dont set any. This command will self-destruct in 60 seconds if there is no answer", 60000).then(async(title) => {
            if (title === false) {
                return await message.channel.send(":x: timeout: command aborted")
            }
            if (title.reply.content !== "none") {
                var embedTitle;
                if (title.reply.content.length > 256) {
                    embedTitle = title.reply.content.substr(0, 253) + "...";
                } else {
                    embedTitle = title.reply.content;
                }
                await title.question.delete();
                client.awaitReply(message, ":gear: Announcement parameter:",
                    "What's the color of this announcement? You can choose between the 3 predefined ones: `red`, `orange`, `lightblue`. Answer with `none` to dont use any", 60000).then(async(userColor) => {
                    if (userColor === false) {
                        return await message.channel.send(":x: timeout: command aborted")
                    }
                    await userColor.question.delete();
                    var color;
                    if (userColor.reply.content === "red") {
                        color = 0xff0000;
                    } else if (userColor.reply.content === "orange") {
                        color = 0xff6600;
                    } else if (userColor.reply.content === "lightblue") {
                        color = 0x33ccff;
                    } else if (userColor.reply.content === "none") {
                        color = 0x000;
                    } else {
                        color = 0x000;
                    }
                    client.awaitReply(message, ":gear: Announcement parameter:", "What's the content of this announcement? You can use the usual markdown, and even masked links using `[masked link](http://google.com)`", 60000).then(async(content) => {
                        if (content === false) {
                            return await message.channel.send(":x: timeout: command aborted")
                        }
                        await content.question.delete();
                        await message.channel.send("Alright, your announcement will looks like that");
                        await message.channel.send({
                            embed: {
                                title: embedTitle,
                                color: color,
                                description: content.reply.content,
                                footer: {
                                    icon_url: message.author.avatarURL,
                                    text: "Announcement by " + message.author.username + "#" + message.author.discriminator
                                }
                            }
                        });
                        client.awaitReply(message, ":gear: Announcement parameter:", "Is that alright with you? Answer with `abort` to abort the announcement. Otherwise, answer with the channel name in which i should send the announcement", 60000).then(async(requestedChannel) => {
                            if (requestedChannel === false) {
                                return await message.channel.send(":x: Timeout: command aborted");
                            }
                            await requestedChannel.question.delete();                            
                            if (requestedChannel.reply.content === "abort") {
                                return await message.channel.send(":x: Command aborted");
                            }
                            const channel = message.guild.channels.find("name", requestedChannel.reply.content.toLowerCase());
                            if (!channel) {
                                return await message.channel.send(":x: The channel you specified does not exist, command aborted")
                            }
                            try {
                                channel.send({
                                    embed: {
                                        title: embedTitle,
                                        color: color,
                                        description: content.reply.content,
                                        footer: {
                                            icon_url: message.author.avatarURL,
                                            text: "Announcement by " + message.author.username + "#" + message.author.discriminator
                                        }
                                    }
                                }).catch(console.error);
                                return await message.channel.send(":white_check_mark:");
                            } catch (err) {
                                console.error(err);
                                return await message.channel.send(":x: An error occured");
                            }
                        })
                    })
                })
            } else {
                client.awaitReply(message, ":gear: Announcement parameter:",
                    "What's the color of this announcement? You can choose between the 3 predefined ones: `red`, `orange`, `lightblue`. Answer with `none` to dont use any", 60000).then(async(userColor) => {
                    if (userColor === false) {
                        return await message.channel.send(":x: timeout: command aborted")
                    }
                    await userColor.question.delete();
                    var color;
                    if (userColor.reply.content === "red") {
                        color = 0xff0000;
                    } else if (userColor.reply.content === "orange") {
                        color = 0xff6600;
                    } else if (userColor.reply.content === "lightblue") {
                        color = 0x33ccff;
                    } else if (userColor.reply.content === "none") {
                        color = 0x000;
                    } else {
                        color = 0x000;
                    }
                    client.awaitReply(message, ":gear: Announcement parameter:", "What's the content of this announcement? You can use the usual markdown, and even masked links using `[masked link](http://google.com)`", 60000).then(async(content) => {
                        if (content === false) {
                            return await message.channel.send(":x: timeout: command aborted")
                        }
                        await content.question.delete();
                        await message.channel.send("Alright, your announcement will looks like that");
                        await message.channel.send({
                            embed: {
                                color: color,
                                description: content.reply.content,
                                footer: {
                                    icon_url: message.author.avatarURL,
                                    text: "Announcement by " + message.author.username + "#" + message.author.discriminator
                                }
                            }
                        });
                        client.awaitReply(message, ":gear: Announcement parameter:", "Is that alright with you? Answer with `abort` to abort the announcement. Otherwise, answer with the channel name in which i should send the announcement", 60000).then(async(requestedChannel) => {
                            if (requestedChannel === false) {
                                return await message.channel.send(":x: Timeout: command aborted");
                            }
                            await requestedChannel.question.delete();
                            if (requestedChannel.reply.content === "abort") {
                                return await message.channel.send(":x: Command aborted");
                            }
                            const channel = message.guild.channels.find("name", requestedChannel.reply.content.toLowerCase());
                            if (!channel) {
                                return await message.channel.send(":x: The channel you specified does not exist, command aborted")
                            }
                            try {
                                channel.send({
                                    embed: {
                                        color: color,
                                        description: content.reply.content,
                                        footer: {
                                            icon_url: message.author.avatarURL,
                                            text: "Announcement by " + message.author.username + "#" + message.author.discriminator
                                        }
                                    }
                                }).catch(console.error);
                                return await message.channel.send(":white_check_mark:");
                            } catch (err) {
                                console.error(err);
                                return await message.channel.send(":x: An error occured");
                            }
                        })
                    })
                })
            }
        })
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
    guildOnly: true,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'announce',
    description: 'Announce something with a fancy embed, you can choose the color, the title...',
    usage: 'announce',
    category: 'utility',
};
