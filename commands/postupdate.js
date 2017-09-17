exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const updateType = await client.awaitReply({
                message: message,
                title: ":gear: Update parameter",
                question: "What is the type of that update?"
            });
            if (!updateType.reply) {
                return resolve(await message.channel.send(":x: Command aborted"));
            }
            updateType.question.delete();
            const updateName = await client.awaitReply({
                message: message,
                title: ":gear: Update parameter",
                question: "What is the name of this update?"
            });
            if (!updateName.reply) {
                return resolve(await message.channel.send(":x: Command aborted"));
            }
            updateName.question.delete();
            const updateContent = await client.awaitReply({
                message: message,
                title: ":gear: Update parameter",
                question: "What is the content of this update?",
                limit: 120000
            });
            if (!updateContent.reply) {
                return resolve(await message.content.send(":x: Command aborted"));
            }
            updateContent.question.delete();
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
    disabled: false,
    permLevel: 42
};

exports.help = {
    name: 'postupdate',
    description: 'Post a new update/changelog which will appear in the changelog command',
    usage: 'postupdate text',
    category: 'admin'
};