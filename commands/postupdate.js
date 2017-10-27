exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const updateType = await message.awaitReply({
                message: {
                    embed: {
                        title: ":gear: Update parameter",
                        description: "What is the type of that update?"
                    }
                }
            });
            if (!updateType.reply) return resolve(await message.channel.send(":x: Command aborted"));

            updateType.query.delete();
            const updateName = await message.awaitReply({
                message: {
                    embed: {
                        title: ":gear: Update parameter",
                        description: "What is the name of this update?"
                    }
                }
            });
            if (!updateName.reply) return resolve(await message.channel.send(":x: Command aborted"));

            updateName.query.delete();
            const updateContent = await message.awaitReply({
                message: {
                    embed: {
                        title: ":gear: Update parameter",
                        description: "What is the content of this update?",
                    }
                },
                timeout: 120000
            });
            if (!updateContent.reply) return resolve(await message.content.send(":x: Command aborted"));

            updateContent.query.delete();
            const changelogs = client.clientData.get("changelogs");
            changelogs.changelogs.unshift({
                type: updateType.reply.content,
                name: updateName.reply.content,
                content: updateContent.reply.content,
                date: `${new Date().getMonth()+1}/${new Date().getDate()}/${new Date().getFullYear()}`
            });
            changelogs.lastUpdateDate = `${new Date().getMonth()+1}/${new Date().getDate()}/${new Date().getFullYear()}`;
            client.clientData.set("changelogs", changelogs);
            resolve(await message.channel.send(":white_check_mark: Alright fam ^"));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'postupdate',
    description: 'Post a new update/changelog which will appear in the changelog command',
    usage: 'postupdate text',
    category: 'admin'
};