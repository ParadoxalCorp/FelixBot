exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let embedObject = {
                description: '',
                footer: {
                    icon_url: message.author.avatarURL,
                    text: message.author.tag
                },
                timestamp: new Date()
            }
            let title = await message.awaitReply({
                message: {
                    embed: {
                        title: ":gear: Announcement parameter:",
                        description: "What's the title of this announcement (max: 256 characters)? Answer with `none` to dont set any"
                    }
                }
            });
            if (!title.reply) {
                title.query.delete();
                return resolve(await message.channel.send(":x: timeout: command aborted"));
            }
            if (title.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            if (title.reply.content.trim() !== 'none') embedObject.title = title.reply.content.substr(0, 256);
            await title.query.delete();
            if (message.deletable) title.reply.delete();
            let userColor = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: Announcement parameter:',
                        description: "What's the color of this announcement? You can choose between the 3 predefined ones: `red`, `orange`, `lightblue`. Answer with `none` to dont use any"
                    }
                }
            });
            if (!userColor.reply) {
                title.query.delete();
                return resolve(await message.channel.send(":x: timeout: command aborted"));
            }
            if (userColor.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            await userColor.query.delete();
            if (userColor.reply.content.trim() === "red") embedObject.color = 0xff0000;
            else if (userColor.reply.content.trim() === "orange") embedObject.color = 0xff6600;
            else if (userColor.reply.content.trim() === "lightblue") embedObject.color = 0x33ccff;
            else if (userColor.reply.content.trim() === "none") embedObject.color = 0x000;
            else embedObject.color = 0x000;
            if (message.deletable) userColor.reply.delete();
            let content = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: Announcement parameter:',
                        description: "What's the content of this announcement? You can use the usual markdown, and even masked links using `[masked link](http://google.com)`",
                        footer: {
                            text: `Time limit: 120 seconds`
                        }
                    }
                },
                timeout: 120000
            });
            if (!content.reply) {
                content.query.delete();
                return resolve(await message.channel.send(":x: timeout: command aborted"));
            }
            if (content.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            embedObject.description = content.reply.content;
            await content.query.delete();
            if (content.reply.deletable) content.reply.delete();
            let mention = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: Announcement parameter:',
                        description: 'Almost there! Choose whether or not i should mention peoples, answer with `everyone`, `here` or anything else to dont mention'
                    }
                }
            });
            let announcementMention = '';
            if (!mention.reply) {
                mention.query.delete();
                return resolve(await message.channel.send(':x: timeout: command aborted'));
            }
            if (mention.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            if (mention.reply.content.trim() === 'here' || mention.reply.content.trim() === 'everyone') announcementMention = `@${mention.reply.content.trim()}`;
            mention.query.delete();
            if (mention.reply.deletable) mention.reply.delete();
            await message.channel.send("Alright, your announcement will looks like that");
            await message.channel.send({
                embed: embedObject
            });
            let requestedChannel = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: Announcement parameter:',
                        description: "Is that alright with you? Answer with `abort` to abort the announcement. Otherwise, answer with the channel name in which i should send the announcement"
                    }
                }
            });
            if (!requestedChannel.reply) {
                requestedChannel.query.delete();
                return resolve(await message.channel.send(":x: Timeout: command aborted"));
            }
            await requestedChannel.query.delete();
            if (requestedChannel.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            const channels = await requestedChannel.reply.getChannelResolvable();
            if (!channels.size) return resolve(await message.channel.send(":x: I couldn't find the channel you specified"));
            try {
                channels.first().send(announcementMention, {
                    embed: embedObject
                });
                resolve(await message.channel.send(":white_check_mark:"));
            } catch (err) {
                resolve(await message.channel.send(":x: An error occurred, this may be because i lack some permissions"));
            }
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
    name: 'announce',
    description: 'Announce something with a fancy embed, you can choose the color, the title...',
    usage: 'announce',
    category: 'moderation',
};