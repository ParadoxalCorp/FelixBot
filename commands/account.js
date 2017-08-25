exports.run = async(client, message) => {
    try {
        var args = message.content.split(/\s+/gim);
        args.shift();
        const userEntry = client.userDatas.get(message.author.id);
        if (args.length === 0) {
            const options = await client.awaitReply({
                message: message,
                title: ':gear: Account settings',
                question: 'Choose which options you would like to set by typing a number```\n[1] - Global level/xp privacy\n[2] - Delete data```'
            });
            if (!options) {
                return await message.channel.send(":x: Command aborted");
            }
            if (isNaN(options.reply.content)) {
                await options.question.delete();
                if (message.guild && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await options.reply.delete();
                }
                return await message.channel.send(":x: The number you specified is not valid");
            }
            if (options.reply.content === "1") {
                const levelPrivacy = await client.awaitReply({
                    message: message,
                    title: ':gear: Global level/exp privacy',
                    question: 'If you set your global level/exp privacy as public, you might appear on the users global leaderboard, available in the `leaderboard` command```\n[1] - Public\n[2] - Private```'
                });
                if (!levelPrivacy) {
                    return await message.channel.send(":x: Command aborted");
                }
                if (isNaN(levelPrivacy.reply.content)) {
                    await levelPrivacy.question.delete();
                    if (message.guild && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await levelPrivacy.reply.delete();
                    }
                    return await message.channel.send(":x: The number you specified is not valid");
                } else if (levelPrivacy.reply.content === "1") {
                    userEntry.publicLevel = true;
                    await levelPrivacy.question.delete();
                    if (message.guild && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await levelPrivacy.reply.delete();
                    }
                    client.userDatas.set(message.author.id, userEntry);
                    return await message.channel.send(":white_check_mark: Alright, i updated your global level/exp privacy");
                } else if (levelPrivacy.reply.content === "2") {
                    userEntry.publicLevel = false;
                    await levelPrivacy.question.delete();
                    if (message.guild && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await levelPrivacy.reply.delete();
                    }
                    client.userDatas.set(message.author.id, userEntry);
                    return await message.channel.send(":white_check_mark: Alright, i updated your global level/exp privacy");
                }
            } else if (options.reply.content === "2") {
                const userEntry = client.userDatas.get(message.author.id);
                const confirmation = await client.awaitReply({
                    message: message,
                    title: ":gear: Account settings",
                    question: "Are you sure you want to delete from our database all your data? Well, that's not really a big deal but you are gonna lose very important things like your love points, everyone need love :v\n\n Just teasing you dont worry, answer with `yes` to confirm or anything else to abort, the process will abort itself if you dont answer within 30 seconds"
                });
                if (!confirmation) {
                    return await message.channel.send(":x: Timeout, process aborted");
                } else if (confirmation.reply.content === "yes") {
                    client.userDatas.delete(message.author.id);
                    return await message.channel.send(":white_check_mark: Alright, all your data have been erased");
                } else {
                    return await message.channel.send(":x: Process aborted");
                }
            }
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'account',
    description: 'Dont you ever wanted to have some control over your account? its obvious? Yeah i feel the same way.. anyway, here you can manage a few things like which data you want public and which not (like experience)',
    usage: 'account',
    category: 'miscellaneous',
};
