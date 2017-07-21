const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const serverEntry = client.database.Data.servers[0][message.guild.id];
        serverEntry.prefix = client.database.Data.global[0].prefix;
        serverEntry.thingsLevel0 = [];
        serverEntry.thingsLevel1 = [];
        serverEntry.thingsLevel2 = [];
        serverEntry.globalLevel = "none";
        serverEntry.updateChannel = "";
        serverEntry.onJoinRole = "";
        serverEntry.greetings = "";
        serverEntry.farewell = "";
        serverEntry.greetingsMethod = "";
        serverEntry.autoAsssignablesRoles = [];
        fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
            if (err) console.error(err)
        })
        return await message.channel.send(":white_check_mark: Okay, i just nuked the database ! https://giphy.com/gifs/explosion-nuclear-12KiGLydHEdak8");
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
    aliases: ["nukedb"],
    disabled: false,
    permLevel: 3
};

exports.help = {
    name: 'resetall',
    description: 'DEATH COMMAND, server owner only',
    usage: 'resetall',
    category: 'moderation',
    detailledUsage: 'This command will basically reset the whole database for your server, the custom prefix, the permissions, the onjoinrole... everything. Of course, only the server owner can use it. Welp, give me a second to rename this to OMEGA 3 DEATH COMMAND or something'
};
