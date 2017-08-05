const fs = require("fs-extra");
exports.run = async(client, message) => {
    try {
        const add = client.searchForParameter(message, "add");
        const remove = client.searchForParameter(message, "remove");
        const current = client.searchForParameter(message, "current", {aliases: ["-current", "-c"], name: "current"});
        const guildEntry = client.guildDatas.get(message.guild.id);
        if ((add) && (!remove) && (!current)) {
            var role = message.content.substr(add.position + add.length + 1).trim();
            if (!message.guild.roles.find("name", role)) {
                return await message.channel.send(":x: Specified role not found: Dont forget to respect case-sensitivty");
            } else {
                role = message.guild.roles.find("name", role);
                if (guildEntry.onJoinRole === "") {
                    try {
                        guildEntry.onJoinRole = role.id;
                        client.guildDatas.set(message.guild.id, guildEntry);
                        return message.channel.send(":white_check_mark: Alright ! I will give the role **" + role.name + "** to every new members");
                    } catch (err) {
                        message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. Feel free to join the support server to learn more");
                        return onJoinRole.sendError(err);
                    }
                } else {
                    return await message.channel.send(":x: There is already a role given to new members, remove it in order to add a new one");
                }
            }
        } else if ((remove) && (!add) && (!current)) {
            var role = message.content.substr(remove.position + remove.length + 1).trim();
            if (guildEntry.onJoinRole === "") {
                return await message.channel.send(":x: There is no role to remove, you should add one before removing one");
            } else {
                try {
                    guildEntry.onJoinRole = "";
                    client.guildDatas.set(message.guild.id, guildEntry);
                    return await message.channel.send(":white_check_mark: Alright ! I wont give a role to new members anymore");
                } catch (err) {
                    await message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. Feel free to join the support server to learn more");
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
            }
        } else if ((current) && (!add) && (remove)) {
            if (guildEntry.onJoinRole === "") {
                return await message.channel.send(":x: There is no role to check, you should add one before checking which one it is");
            } else {
                var role = message.guild.roles.get(guildEntry.onJoinRole);
                return await message.channel.send("The role that i currently give to every new members is **" + role.name + "**");
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
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["onjoinr", "addrole"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'onjoinrole',
    parameters: '`-add`, `-remove`, `-current`',
    description: 'Add, remove or display the role that Felix will give to every new members',
    usage: 'onjoinrole -add Members',
    category: 'settings'
};
