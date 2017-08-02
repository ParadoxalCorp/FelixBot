const fs = require('fs-extra');

exports.run = async(client, message) => {
    try {
        const add = message.content.indexOf("-add");
        const remove = message.content.indexOf("-remove");
        const guildEntry = client.guildDatas.get(message.guild.id);
        if ((add === -1) && (remove === -1)) {
            if (guildEntry.autoAssignablesRoles.length === 0) {
                return await message.channel.send(":x: There is no self-assignable role");
            }
            var selfAssignRoles;
            guildEntry.autoAssignablesRoles.forEach(function (role) {
                if (!message.guild.roles.get(role)) { //Automatically remove the role from the db if the said role doesnt exist anymore
                    guildEntry.autoAssignablesRoles.splice(guildEntry.autoAssignablesRoles.indexOf(role.id), 1);
                    client.guildDatas.set(message.author.id, guildEntry);
                } else {
                    selfAssignRoles += `${message.guild.roles.get(role).name}\n`;
                }
            });
            if (selfAssignRoles === "") {
                return await message.channel.send(":x: There is no self-assignable role");
            }
            selfAssignRoles = selfAssignRoles.replace(/undefined/gim, "");
            return await message.channel.send("Here's the self-assignables roles list: ```\n" + selfAssignRoles + "```");
        } else if ((add !== -1) && (remove === -1)) {
            const roleName = message.content.substr(add + 5).trim();
            if (roleName === "") {
                return await message.channel.send(":x: You did not specified the role to add");
            }
            if (!message.guild.roles.find("name", roleName)) {
                return await message.channel.send(":x: The role you specified does not exist");
            }
            const role = message.guild.roles.find("name", roleName);
            if (guildEntry.autoAssignablesRoles.indexOf(role.id) !== -1) {
                return await message.channel.send(":x: The role you specified is already a self-assignable role");
            }
            guildEntry.autoAssignablesRoles.push(role.id);
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, i set the role **" + roleName + "** as a self-assignable role");
        } else if ((remove !== -1) && (add === -1)) {
            const roleName = message.content.substr(remove + 8).trim();
            if (roleName === "") {
                return await message.channel.send(":x: You did not specified the role to remove");
            }
            if (!message.guild.roles.find("name", roleName)) {
                return await message.channel.send(":x: The role you specified does not exist");
            }
            const role = message.guild.roles.find("name", roleName);
            if (guildEntry.autoAssignablesRoles.indexOf(role.id) === -1) {
                return await message.channel.send(":x: The role you specified is not a self-assignable role");
            }
            guildEntry.autoAssignablesRoles.splice(guildEntry.autoAssignablesRoles.indexOf(role.id), 1);
            client.guildDatas.set(message.author.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, the role **" + roleName + "** is not anymore a self-assignable role");
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
    permLevel: 2
};

exports.help = {
    name: 'autorole',
    parameters: '`-add`, `-remove`',
    description: 'Manage the auto-assignables roles',
    usage: 'autorole -add nsfw',
    category: 'settings',
    detailledUsage: 'By adding a role to the self-assignables roles list, users will be able to give themselves this role using `{prefix}iam rolename`\n`{prefix}autorole -remove nsfw` Will remove the role `nsfw` from the list of self-assignables roles\n`{prefix}autorole` Will return the list of self-assignables roles'
};
