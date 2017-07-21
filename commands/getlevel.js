const fs = require("fs-extra");
exports.run = async(client, message) => {
    var user = message.content.indexOf("-u");
    var channel = message.content.indexOf("-c");
    var role = message.content.indexOf("-r");
    const all = message.content.indexOf("-all");
    const guildEntry = client.database.Data.servers[0][message.guild.id];
    var mentionned = message.mentions.users.first();
    var hasLevel0 = client.database.Data.servers[0][message.guild.id].thingsLevel0;
    var hasLevel1 = client.database.Data.servers[0][message.guild.id].thingsLevel1;
    var hasLevel2 = client.database.Data.servers[0][message.guild.id].thingsLevel2;
    try {
        if (mentionned) {
            var mentionnedId = mentionned.id;
            var member = message.guild.members.get(mentionnedId);
        }
        if ((user !== -1) && (channel === -1) && (role === -1)) {
            if (!mentionned) {
                return await message.channel.send(":x: You did not specify a user");
            } else {
                if (hasLevel0.indexOf(mentionnedId) !== -1) {
                    return message.channel.send("**" + mentionned.username + "#" + mentionned.discriminator + "** is level 0");
                }
                if (hasLevel1.indexOf(mentionnedId) !== -1) {
                    return message.channel.send("**" + mentionned.username + "#" + mentionned.discriminator + "** is level 1");
                }
                if (hasLevel2.indexOf(mentionnedId) !== -1) {
                    return message.channel.send("**" + mentionned.username + "#" + mentionned.discriminator + "** is level 2");
                }
                if ((hasLevel0.indexOf(mentionnedId) === -1) && (hasLevel1.indexOf(mentionnedId) === -1) && (hasLevel2.indexOf(mentionnedId) === -1)) {
                    return message.channel.send(":x: There's no level for this user, so their default level is 1");
                }
            }
        } else if ((user === -1) && (channel !== -1) && (role === -1)) {
            var channelname = message.content.substr(channel + 3).toLowerCase();
            if (channelname !== "") {
                if (!message.guild.channels.find("name", channelname)) {
                    return await message.channel.send(":x: The channel you specified does not exist");
                } else {
                    var guildChan = message.guild.channels.find("name", channelname);
                    if (hasLevel0.indexOf(guildChan.id) !== -1) {
                        return message.channel.send("**#" + guildChan.name + "** is level 0");
                    }
                    if (hasLevel1.indexOf(guildChan.id) !== -1) {
                        return message.channel.send("**#" + guildChan.name + "** is level 1");
                    }
                    if (hasLevel2.indexOf(guildChan.id) !== -1) {
                        return message.channel.send("**#" + guildChan.name + "** is level 2");
                    }
                    if ((hasLevel0.indexOf(guildChan.id) === -1) && (hasLevel1.indexOf(guildChan.id) === -1) && (hasLevel2.indexOf(guildChan.id) === -1)) {
                        return message.channel.send(":x: There's no level set for this channel");
                    }
                }
            } else {
                var guildChan = message.channel;
                if (hasLevel0.indexOf(guildChan.id) !== -1) {
                    return message.channel.send("**#" + guildChan.name + "** is level 0");
                }
                if (hasLevel1.indexOf(guildChan.id) !== -1) {
                    return message.channel.send("**#" + guildChan.name + "** is level 1");
                }
                if (hasLevel2.indexOf(guildChan.id) !== -1) {
                    return message.channel.send("**#" + guildChan.name + "** is level 2");
                }
                if ((hasLevel0.indexOf(guildChan.id) === -1) && (hasLevel1.indexOf(guildChan.id) === -1) && (hasLevel2.indexOf(guildChan.id) === -1)) {
                    return message.channel.send(":x: There's no level set for this channel");
                }
            }
        } else if ((role !== -1) && (channel === -1) && (user === -1)) {
            var rolename = message.content.substr(role + 3);
            if (rolename === "") {
                return message.channel.send(":x: You did not specify a role name");
            } else {
                if (!message.guild.roles.find("name", rolename)) {
                    return message.channel.send(":x: That role does not exist");
                } else {
                    var role = message.guild.roles.find("name", rolename);
                    if (hasLevel0.indexOf(role.id) !== -1) {
                        return message.channel.send("**" + role.name + "** is level 0");
                    }
                    if (hasLevel1.indexOf(role.id) !== -1) {
                        return message.channel.send("**" + role.name + "** is level 1");
                    }
                    if (hasLevel2.indexOf(role.id) !== -1) {
                        return message.channel.send("**" + role.name + "** is level 2");
                    }
                    if ((hasLevel0.indexOf(role.id) === -1) && (hasLevel1.indexOf(role.id) === -1) && (hasLevel2.indexOf(role.id) === -1)) {
                        return message.channel.send(":x: There is no level set for that role");
                    }
                }
            }
        } else if ((all !== -1) && (role === -1) && (user === -1) && (channel === -1)) {
            var rolesLevel0 = [],
                rolesLevel1 = [],
                rolesLevel2 = [],
                channelsLevel0 = [],
                channelsLevel1 = [],
                channelsLevel2 = [],
                usersLevel0 = [],
                usersLevel1 = [],
                usersLevel2 = [],
                guildLevel;
            if ((guildEntry.thingsLevel0.length === 0) && (guildEntry.thingsLevel1.length === 0) && (guildEntry.thingsLevel2.length === 0)) {
                return await message.channel.send(":x: There is nothing that has a level on this server");
            }
            if (guildEntry.thingsLevel0.length > 0) {
                guildEntry.thingsLevel0.forEach(function (thing) {
                    if (message.guild.roles.get(thing)) {
                        rolesLevel0.push(message.guild.roles.get(thing).name);
                    } else if (message.guild.channels.get(thing)) {
                        channelsLevel0.push(message.guild.channels.get(thing).name);
                    } else if (message.guild.members.get(thing)) {
                        usersLevel0.push(message.guild.members.get(thing).user.username);
                    }
                });
            }
            if (guildEntry.thingsLevel1.length > 0) {
                guildEntry.thingsLevel1.forEach(function (thing) {
                    if (message.guild.roles.get(thing)) {
                        rolesLevel1.push(message.guild.roles.get(thing).name);
                    } else if (message.guild.channels.get(thing)) {
                        channelsLevel1.push(message.guild.channels.get(thing).name);
                    } else if (message.guild.members.get(thing)) {
                        usersLevel1.push(message.guild.members.get(thing).user.username);
                    }
                });
            }
            if (guildEntry.thingsLevel2.length > 0) {
                guildEntry.thingsLevel2.forEach(function (thing) {
                    if (message.guild.roles.get(thing)) {
                        rolesLevel2.push(message.guild.roles.get(thing).name);
                    } else if (message.guild.channels.get(thing)) {
                        channelsLevel2.push(message.guild.channels.get(thing).name);
                    } else if (message.guild.members.get(thing)) {
                        usersLevel2.push(message.guild.members.get(thing).user.username);
                    }
                });
            }
            //Build the list ignoring the things without any level
            var list = "";
            if (rolesLevel0.length > 0) {
                list += `Roles level 0: ${rolesLevel0}\n`;
            }
            if (rolesLevel1.length > 0) {
                list += `Roles level 1: ${rolesLevel1}\n`;
            }
            if (rolesLevel2.length > 0) {
                list += `Roles level 2: ${rolesLevel2}\n`;
            }
            if (channelsLevel0.length > 0) {
                list += `Channels level 0: ${channelsLevel0}\n`;
            }
            if (channelsLevel1.length > 0) {
                list += `Channels level 1: ${channelsLevel1}\n`;
            }
            if (channelsLevel2.length > 0) {
                list += `Channels level 2: ${channelsLevel2}\n`;
            }
            if (usersLevel0.length > 0) {
                list += `Users level 0: ${usersLevel0.toString()}\n`;
            }
            if (usersLevel1.length > 0) {
                list += `Users level 1: ${usersLevel1}\n`;
            }
            if (usersLevel2.length > 0) {
                list += `Users level 2: ${usersLevel2}\n`;
            }
            if (guildEntry.globalLevel !== "none") {
                list += `Server level: ${guildEntry.globalLevel}\n`;
            }
            console.log(usersLevel0);
            guildLevel = guildEntry.globalLevel;
            if (list.length > 1920) {
                return await message.channel.send(":x: The list is exceeding the Discord 2000 characters limit, you should optimize the permissions on your server, join the support server to learn how to optimize the permissions");
            }
            return await message.channel.send(`Here's the list of everything that has a level on your server \`\`\`\n${list}\`\`\``);
        } else if ((role === -1) && (user === -1) && (channel === -1) && (all === -1)) {
            if (client.database.Data.servers[0][message.guild.id].globalLevel === "none") {
                return await message.channel.send(":x: There is no level set for the whole server");
            } else {
                return await message.channel.send("This server global level is " + client.database.Data.servers[0][message.guild.id].globalLevel);
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
    aliases: ["gl"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'getlevel',
    parameters: '`-r`(role), `-c`(channel), `-u`(user), `-all`',
    description: 'Get the access level of the targetted element(role, user...). If no arguments are provided, it will get the server access level',
    usage: 'getlevel -u @someone',
    category: 'moderation',
    detailledUsage: '`{prefix}getlevel -c general` Will return the level of the channel `#general`\n`{prefix}getlevel -r Moderator` Will return the level of the role `Moderator`\n`{prefix}getlevel -all` Will return the list of everything that has a level on this server'
};
