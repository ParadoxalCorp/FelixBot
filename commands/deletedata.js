exports.run = async(client, message) => {
    try {
        const userEntry = client.userDatas.get(message.author.id);
        const confirmation = await client.awaitReply({
            message: message,
            title: ":gear: Account settings",
            question: "Are you sure you want to delete from our database all your data? Well, that's not really a big deal but you are gonna lose very important things like your love points, everyone need love :v\n\n Just teasing you dont worry, answer with `yes` to confirm or anything else to abort, the process will abort itself if you dont answer within 30 seconds"
        });
        if (!confirmation) {
            return await message.channel.send(":x: Timeout, process aborted");
        }
        else if (confirmation.reply.content === "yes") {
            client.userDatas.delete(message.author.id);
            return await message.channel.send(":white_check_mark: Alright, all your data have been erased");
        } else {
            return await message.channel.send(":x: Process aborted");
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
    name: 'deletedata',
    description: 'That command basically delete all your datas that Felix store in the database(basically, your id and your mal account if you linked it ^^ oh and your love points as well), but remember that Felix will store your datas again once you use a command',
    usage: 'deletedatas',
    category: 'miscellaneous',
};
