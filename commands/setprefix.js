const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        var checkArgs = message.content.indexOf(" ");
        var args;
        if (checkArgs !== -1) {
            args = message.content.substr(checkArgs + 1).trim();
        } else {
            return await message.channel.send(":x: You need to specify the new prefix")
        }
        if (!args) {
            return await message.channel.send(":x: You need to specify the new prefix");
        } else {
            client.database.Data.servers[0][message.guild.id].prefix = args;
            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                if (err) console.error(err)
            });
            return await message.channel.send("The new prefix has sucesfully been set to **" + args + "**");
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
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['prefix'],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'setprefix',
    description: 'Change Felix\'s prefix on this server, a access level of 2 is required to use this command',
    usage: 'setprefix /',
    category: 'settings'
};
