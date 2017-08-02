const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const guildEntry = client.guildDatas.get(message.author.id);
        guildEntry.thingsLevel0 = [],
            guildEntry.thingsLevel1 = [],
            guildEntry.thingsLevel2 = [],
            guildEntry.globalLevel = "none";
        client.guildDatas.set(message.guild.id, guildEntry);
        return await message.channel.send(":white_check_mark: Okay, i just nuked the levels ! https://giphy.com/gifs/explosion-nuclear-12KiGLydHEdak8");
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
    aliases: ["nl"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'resetlevels',
    description: 'Reset every levels on this server',
    usage: 'resetlevels',
    category: 'moderation',
};
