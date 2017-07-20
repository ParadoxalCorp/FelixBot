const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const guildEntry = client.database.Data.servers[0][message.guild.id];
        const whitespace = message.content.indexOf(" ");
        if (whitespace === -1) {
            if (guildEntry.autoAssignablesRoles.length === 0) {
                return await message.channel.send(":x: There is no self-assignable role");
            }
            var selfAssignRoles;
            guildEntry.autoAssignablesRoles.forEach(function (role) {
                if (!message.guild.roles.get(role)) {
                    guildEntry.autoAssignablesRoles.splice(guildEntry.autoAssignablesRoles.indexOf(role), 1);
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), err => {
                        if (err) console.error(err)
                    });
                } else {
                    selfAssignRoles += `${message.guild.roles.get(role).name}\n`;
                }
            });
            if (selfAssignRoles === "") {
                return await message.channel.send(":x: There is no self-assignable role");
            }
            selfAssignRoles += message.guild.roles.get(guildEntry.autoAssignablesRoles[0]).name;            
            selfAssignRoles = selfAssignRoles.replace(/undefined/gim, "");
            return await message.channel.send("Here's the self-assignables roles list: ```" + selfAssignRoles + "```");
        } else {
            const roleName = message.content.substr(whitespace + 1).trim();
            if (roleName === "") {
                return await message.channel.send(":x: You didnt specified any role");
            }
            if (!message.guild.roles.find("name", roleName)) {
                return await message.channel.send(":x: The role you specified does not exist in this server");
            }
            const role = message.guild.roles.find("name", roleName);
            if (guildEntry.autoAssignablesRoles.indexOf(role.id) === -1) {
                return await message.channel.send(":x: The role you specified is not a self-assignable role");
            }
            if (!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) {
                return await message.channel.send(":x: I dont have the permission to do that");
            }
            message.guild.member(message.author).addRole(role);
            return await message.channel.send(":white_check_mark: Alright, i gave you the role **" + role.name + "**");
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'iam',
    description: 'Give you a self-assignable role',
    usage: 'iam nsfw',
    category: 'generic',
    detailledUsage: '`{prefix}iam` Will return the self-assignables roles list\n`{prefix}iam Neko` Will give you the role `Neko` if this role is self-assignable'
};
