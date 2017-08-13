const fs = require("fs-extra");
exports.run = async(client, message) => {
    var user = client.searchForParameter(message, "user", {
        aliases: ["-user", "-u"],
        name: "user"
    });
    var channel = client.searchForParameter(message, "channel", {
        aliases: ["-channel", "-chan", "-c"],
        name: "channel"
    });
    var role = client.searchForParameter(message, "role", {
        aliases: ["-role", "-r"],
        name: "role"
    });
    const all = client.searchForParameter(message, "all", {
        aliases: ["-all", "-a"],
        name: "all"
    });
    const guildEntry = client.guildDatas.get(message.guild.id),
        mentionned = message.mentions.users.first(),
        hasLevel0 = guildEntry.thingsLevel0,
        hasLevel1 = guildEntry.thingsLevel1,
        hasLevel2 = guildEntry.thingsLevel2;
    const getEffectiveLevel = function (user) {
        var usrLevel;
        var changeFactors = [];
        var isAdmin = message.guild.member(user).hasPermission("ADMINISTRATOR");
        var hasLevel42 = client.config.thingsLevel42;
        var globalLvl = guildEntry.globalLevel; //the server level
        var userId = user.id;
        //----global check----                     //The following checks are just to determine the user access level by using the execution order
        if (globalLvl !== "none") {
            var globalToNum = Number(globalLvl);
            usrLevel = globalToNum;
            changeFactors.push("The global level change the effective level to " + globalToNum);
        }
        //-----channels check-----
        if (hasLevel0.indexOf(message.channel.id) !== -1) {
            usrLevel = 0;
            changeFactors.push("This channel level change the effective level to 0");
        }
        if (hasLevel1.indexOf(message.channel.id) !== -1) {
            usrLevel = 1;
            changeFactors.push("This channel level change the effective level to 1");
        }
        if (hasLevel2.indexOf(message.channel.id) !== -1) {
            usrLevel = 2;
            changeFactors.push("This channel level change the effective level to 2");
        }
        //-----roles check-----
        var rolesInDb = [] //Array in case there are more than 1 role with level that the user has
        var highestRole = "none";
        for (var [key, value] of message.guild.members.get(user.id).roles) {
            if ((hasLevel0.indexOf(key) !== -1) || (hasLevel1.indexOf(key) !== -1) || (hasLevel2.indexOf(key) !== -1)) {
                rolesInDb.push(key);
            }
        }
        if (rolesInDb.length === 1) {
            highestRole = rolesInDb[0];
            if (hasLevel0.indexOf(rolesInDb[0]) !== -1) {
                changeFactors.push(`The role ${message.guild.roles.get(rolesInDb[0]).name} level change the effective level to 0`);
                usrLevel = 0;
            }
            if (hasLevel1.indexOf(rolesInDb[0]) !== -1) {
                changeFactors.push(`The role ${message.guild.roles.get(rolesInDb[0]).name} level change the effective level to 1`);
                usrLevel = 1;
            }
            if (hasLevel2.indexOf(rolesInDb[0]) !== -1) {
                changeFactors.push(`The role ${message.guild.roles.get(rolesInDb[0]).name} level change the effective level to 2`);
                usrLevel = 2;
            }
        } else if (rolesInDb.length > 1) { //If there are more than 1 role with level that the user has, compare and only keep the highest one
            var i;
            for (i = 0; i < rolesInDb.length; i++) {
                if (highestRole === "none") {
                    var compare = message.guild.roles.get(rolesInDb[i]).comparePositionTo(message.guild.roles.get(rolesInDb[i + 1]))
                    if (compare > 0) {
                        highestRole = rolesInDb[i];
                    } else {
                        highestRole = rolesInDb[i + 1];
                    }
                } else {
                    var compare = message.guild.roles.get(rolesInDb[i]).comparePositionTo(message.guild.roles.get(highestRole));
                    if (compare > 0) {
                        highestRole = rolesInDb[i];
                    }
                }
            }
            if (hasLevel0.indexOf(highestRole) !== -1) {
                changeFactors.push(`The role ${message.guild.roles.get(highestRole).name} level change the effective level to 0`);
                usrLevel = 0;
            }
            if (hasLevel1.indexOf(highestRole) !== -1) {
                changeFactors.push(`The role ${message.guild.roles.get(highestRole).name} level change the effective level to 1`);
                usrLevel = 1;
            }
            if (hasLevel2.indexOf(highestRole) !== -1) {
                changeFactors.push(`The role ${message.guild.roles.get(highestRole).name} level change the effective level to 2`);
                usrLevel = 2;
            }
        }
        //-----users check-----
        if (hasLevel0.indexOf(userId) !== -1) {
            changeFactors.push(`The user level change the effective level to 0`);
            usrLevel = 0;
        }
        if (hasLevel1.indexOf(userId) !== -1) {
            changeFactors.push(`The user level change the effective level to 1`);
            usrLevel = 1;
        }
        if (hasLevel2.indexOf(userId) !== -1) {
            changeFactors.push(`The user level change the effective level to 2`);
            usrLevel = 2;
        }
        if (isAdmin) {
            changeFactors.push(`The administrator permissions of the user change the effective level to 2`);
            usrLevel = 2;
        }
        if (user.id === message.guild.ownerID) { //Give the level 3 of death to the guilds owners
            changeFactors.push(`The server ownership of the user change the effective level to 3`);
            usrLevel = 3;
        }
        if (hasLevel42.indexOf(userId) !== -1) {
            usrLevel = 42;
        }
        if ((!isAdmin) && (hasLevel0.indexOf(userId) === -1) && (hasLevel1.indexOf(userId) === -1) && (hasLevel2.indexOf(userId) === -1) && (hasLevel42.indexOf(userId) === -1) && (hasLevel0.indexOf(message.channel.id) === -1) && (hasLevel1.indexOf(message.channel.id) === -1) && (hasLevel2.indexOf(message.channel.id) === -1) && (globalLvl === "none") && (hasLevel0.indexOf(highestRole) === -1) && (hasLevel1.indexOf(highestRole) === -1) && (hasLevel2.indexOf(highestRole) === -1) && (message.author.id !== message.guild.ownerID)) {
            usrLevel = 1; //If there is no level set for this user/channel/server/role, give the user the default level
        }
        return {
            effectiveLevel: usrLevel,
            factorsChange: changeFactors
        }
    }
    try {
        if (mentionned) {
            var mentionnedId = mentionned.id;
            var member = message.guild.members.get(mentionnedId);
        }
        if ((user) && (!channel) && (!role)) {
            if (!mentionned) {
                return await message.channel.send(":x: You did not specify a user");
            } else {
                const effectiveLevel = getEffectiveLevel(mentionned);
                if (hasLevel0.indexOf(mentionnedId) !== -1) {
                    return await message.channel.send("**" + mentionned.username + "#" + mentionned.discriminator + "** is level 0\n\n```\nThe specified user effective level is " + effectiveLevel.effectiveLevel + "\n" + effectiveLevel.factorsChange.map(f => `=>${f}`).join("\n") + "```");
                }
                if (hasLevel1.indexOf(mentionnedId) !== -1) {
                    return await message.channel.send("**" + mentionned.username + "#" + mentionned.discriminator + "** is level 1\n\n```\nThe specified user effective level is " + effectiveLevel.effectiveLevel + "\n" + effectiveLevel.factorsChange.map(f => `=>${f}`).join("\n") + "```");
                }
                if (hasLevel2.indexOf(mentionnedId) !== -1) {
                    return await message.channel.send("**" + mentionned.username + "#" + mentionned.discriminator + "** is level 2\n\n```\nThe specified user effective level is " + effectiveLevel.effectiveLevel + "\n" + effectiveLevel.factorsChange.map(f => `=>${f}`).join("\n") + "```");
                }
                if ((hasLevel0.indexOf(mentionnedId) === -1) && (hasLevel1.indexOf(mentionnedId) === -1) && (hasLevel2.indexOf(mentionnedId) === -1)) {
                    return await message.channel.send(":x: There's no level for this user, so their default level is 1\n\n```\nThe specified user effective level is " + effectiveLevel.effectiveLevel + "\n" + effectiveLevel.factorsChange.map(f => `=>${f}`).join("\n") + "```");
                }
            }
        } else if ((channel) && (!user) && (!role)) {
            var channelname = message.content.substr(channel.position + channel.length + 1).toLowerCase().trim();
            if (channelname !== "") {
                if (!message.guild.channels.find("name", channelname)) {
                    return await message.channel.send(":x: The channel you specified does not exist");
                } else {
                    var guildChan = message.guild.channels.find("name", channelname);
                    if (hasLevel0.indexOf(guildChan.id) !== -1) {
                        return await message.channel.send("**#" + guildChan.name + "** is level 0");
                    }
                    if (hasLevel1.indexOf(guildChan.id) !== -1) {
                        return await message.channel.send("**#" + guildChan.name + "** is level 1");
                    }
                    if (hasLevel2.indexOf(guildChan.id) !== -1) {
                        return await message.channel.send("**#" + guildChan.name + "** is level 2");
                    }
                    if ((hasLevel0.indexOf(guildChan.id) === -1) && (hasLevel1.indexOf(guildChan.id) === -1) && (hasLevel2.indexOf(guildChan.id) === -1)) {
                        return await message.channel.send(":x: There's no level set for this channel");
                    }
                }
            } else {
                var guildChan = message.channel;
                if (hasLevel0.indexOf(guildChan.id) !== -1) {
                    return await message.channel.send("**#" + guildChan.name + "** is level 0");
                }
                if (hasLevel1.indexOf(guildChan.id) !== -1) {
                    return await message.channel.send("**#" + guildChan.name + "** is level 1");
                }
                if (hasLevel2.indexOf(guildChan.id) !== -1) {
                    return await message.channel.send("**#" + guildChan.name + "** is level 2");
                }
                if ((hasLevel0.indexOf(guildChan.id) === -1) && (hasLevel1.indexOf(guildChan.id) === -1) && (hasLevel2.indexOf(guildChan.id) === -1)) {
                    return await message.channel.send(":x: There's no level set for this channel");
                }
            }
        } else if ((role) && (!channel) && (!user)) {
            var rolename = message.content.substr(role.position + role.length + 1).trim();
            if (rolename === "") {
                return await message.channel.send(":x: You did not specify a role name");
            } else {
                if (!message.guild.roles.find("name", rolename)) {
                    return await message.channel.send(":x: That role does not exist");
                } else {
                    var role = message.guild.roles.find("name", rolename);
                    if (hasLevel0.indexOf(role.id) !== -1) {
                        return await message.channel.send("**" + role.name + "** is level 0");
                    }
                    if (hasLevel1.indexOf(role.id) !== -1) {
                        return await message.channel.send("**" + role.name + "** is level 1");
                    }
                    if (hasLevel2.indexOf(role.id) !== -1) {
                        return await message.channel.send("**" + role.name + "** is level 2");
                    }
                    if ((hasLevel0.indexOf(role.id) === -1) && (hasLevel1.indexOf(role.id) === -1) && (hasLevel2.indexOf(role.id) === -1)) {
                        return await message.channel.send(":x: There is no level set for that role");
                    }
                }
            }
        } else if ((all) && (!role) && (!user) && (!channel)) {
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
            var list = [];
            if (rolesLevel0.length > 0) {
                list.push(`Roles level 0: ${rolesLevel0}`);
            }
            if (rolesLevel1.length > 0) {
                list.push(`Roles level 1: ${rolesLevel1}`);
            }
            if (rolesLevel2.length > 0) {
                list.push(`Roles level 2: ${rolesLevel2}`);
            }
            if (channelsLevel0.length > 0) {
                list.push(`Channels level 0: ${channelsLevel0}`);
            }
            if (channelsLevel1.length > 0) {
                list.push(`Channels level 1: ${channelsLevel1}`);
            }
            if (channelsLevel2.length > 0) {
                list.push(`Channels level 2: ${channelsLevel2}`);
            }
            if (usersLevel0.length > 0) {
                list.push(`Users level 0: ${usersLevel0}`);
            }
            if (usersLevel1.length > 0) {
                list.push(`Users level 1: ${usersLevel1}`);
            }
            if (usersLevel2.length > 0) {
                list.push(`Users level 2: ${usersLevel2}`);
            }
            if (guildEntry.globalLevel !== "none") {
                list.push(`Server level: ${guildEntry.globalLevel}`);
            }
            guildLevel = guildEntry.globalLevel;
            if (list.toString().length > 1950) {
                return await message.channel.send(client.pageResults(message, "Here's the list of the permissions set in your server ", list));
            }
            return await message.channel.send(client.pageResults(message, "Here's the list of the permissions set in your server ", list));
        } else if ((role === -1) && (user === -1) && (channel === -1) && (all === -1)) {
            if (guildEntry.globalLevel === "none") {
                return await message.channel.send(":x: There is no level set for the whole server");
            } else {
                return await message.channel.send("This server global level is " + guildEntry.globalLevel);
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
    parameters: '`-role`, `-channel`, `-user`, `-all`',
    description: 'Get the access level of the targetted element(role, user...). If no arguments are provided, it will get the server access level',
    usage: 'getlevel -u @someone',
    category: 'moderation',
    detailledUsage: '`{prefix}getlevel -c general` Will return the level of the channel `#general`\n`{prefix}getlevel -r Moderator` Will return the level of the role `Moderator`\n`{prefix}getlevel -all` Will return the list of everything that has a level on this server'
};
