const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const remove = message.content.indexOf("-remove");
        const userEntry = client.database.Data.users[0][message.author.id];
        const whitespace = message.content.indexOf(" ");
        if (remove !== -1) {
            userEntry.afk = "";
            fs.writeFile(client.dbPath, JSON.stringify(client.database), err => {
                if (err) console.error(err)
            });
            return await message.channel.send(":white_check_mark: Alright, i removed your afk status");
        }
        if (whitespace === -1) {
            return await message.channel.send(":x: You cannot set your afk status to nothing");
        }
        userEntry.afk = message.content.substr(whitespace + 1);
        fs.writeFile(client.dbPath, JSON.stringify(client.database), err => {
            if (err) console.error(err)
        });
        return await message.channel.send(":white_check_mark: Alright, i updated your afk status");
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
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
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
    name: 'afk',
    parameters: '`-remove`',
    description: 'Update your afk status, Felix will display your afk message everytime you will get mentionned',
    usage: 'afk im busy playing',
    category: 'generic',
    detailledUsage: 'You can remove your afk status using `{prefix}afk -remove`, if you dont use any parameters, it will update your afk message'
};
