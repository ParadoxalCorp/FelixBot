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
            let title = await client.awaitReply({
                message: message,
                title: ":gear: Announcement parameter:",
                question: "What's the title of this announcement (max: 256 characters)? Answer with `none` to dont set any"
            });
            if (!title.reply) {
                title.question.delete();
                return resolve(await message.channel.send(":x: timeout: command aborted"));
            }
            if (title.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            if (title.reply.content.trim() !== 'none') embedObject.title = title.reply.content.substr(0, 256);
            await title.question.delete();
            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) title.reply.delete();
            let userColor = await client.awaitReply({
                message: message,
                title: ':gear: Announcement parameter:',
                question: "What's the color of this announcement? You can choose between the 3 predefined ones: `red`, `orange`, `lightblue`. Answer with `none` to dont use any"
            });
            if (!userColor.reply) {
                title.question.delete();
                return resolve(await message.channel.send(":x: timeout: command aborted"));
            }
            if (userColor.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            await userColor.question.delete();
            if (userColor.reply.content.trim() === "red") embedObject.color = 0xff0000;
            else if (userColor.reply.content.trim() === "orange") embedObject.color = 0xff6600;
            else if (userColor.reply.content.trim() === "lightblue") embedObject.color = 0x33ccff;
            else if (userColor.reply.content.trim() === "none") embedObject.color = 0x000;
            else embedObject.color = 0x000;
            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) userColor.reply.delete();
            let content = await client.awaitReply({
                message: message,
                title: ':gear: Announcement parameter:',
                question: "What's the content of this announcement? You can use the usual markdown, and even masked links using `[masked link](http://google.com)`",
                limit: 120000
            })
            if (!content.reply) {
                content.question.delete();
                return resolve(await message.channel.send(":x: timeout: command aborted"));
            }
            if (content.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            embedObject.description = content.reply.content;
            await content.question.delete();
            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) content.reply.delete();
            let mention = await client.awaitReply({
                message: message,
                title: ':gear: Announcement parameter:',
                question: 'Almost there! Choose whether or not i should mention peoples, answer with `everyone`, `here` or anything else to dont mention'
            });
            let announcementMention = '';
            if (!mention.reply) {
                mention.question.delete();
                return resolve(await message.channel.send(':x: timeout: command aborted'));
            }
            if (mention.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            if (mention.reply.content.trim() === 'here' || mention.reply.content.trim() === 'everyone') announcementMention = `@${mention.reply.content.trim()}`;
            mention.question.delete();
            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) mention.reply.delete();
            await message.channel.send("Alright, your announcement will looks like that");
            await message.channel.send({
                embed: embedObject
            });
            let requestedChannel = await client.awaitReply({
                message: message,
                title: ':gear: Announcement parameter:',
                question: "Is that alright with you? Answer with `abort` to abort the announcement. Otherwise, answer with the channel name in which i should send the announcement"
            });
            if (!requestedChannel.reply) {
                requestedChannel.question.delete();
                return resolve(await message.channel.send(":x: Timeout: command aborted"));
            }
            await requestedChannel.question.delete();
            if (requestedChannel.reply.content.trim() === "abort") return resolve(await message.channel.send(":x: Command aborted"));
            const channels = await client.getChannelResolvable(requestedChannel.reply, {
                charLimit: 2
            });
            if (!channels.size) {
                return resolve(await message.channel.send(":x: I couldn't find the channel you specified"));
            }
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
    permLevel: 2
};

exports.help = {
    name: 'announce',
    description: 'Announce something with a fancy embed, you can choose the color, the title...',
    usage: 'announce',
    category: 'moderation',
};