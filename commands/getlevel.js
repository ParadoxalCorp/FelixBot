exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        var user = await client.searchForParameter({
            message: message,
            parameter: "user"
        });
        var role = await client.searchForParameter({
            message: message,
            parameter: "role"
        });
        var channel = await client.searchForParameter({
            message: message,
            parameter: "channel"
        });
        var all = await client.searchForParameter({
            message: message,
            parameter: "all",
            newParameters: {
                aliases: ["-all", "-a"],
                name: "all"
            }
        });
        const guildEntry = client.guildData.get(message.guild.id),
            mentionned = message.mentions.users.first(),
            hasLevel0 = guildEntry.permissionsLevels.things[0],
            hasLevel1 = guildEntry.permissionsLevels.things[1],
            hasLevel2 = guildEntry.permissionsLevels.things[2];
        const getEffectiveLevel = function(user) {
            var usrLevel = false;
            var changeFactors = [];
            var isAdmin = message.guild.member(user).hasPermission("ADMINISTRATOR");
            var hasLevel42 = client.config.thingsLevel42;
            var globalLvl = guildEntry.permissionsLevels.globalLevel; //the server level
            var userId = user.id;
            //----global check----                     //The following checks are just to determine the user access level by using the execution order
            if (globalLvl !== "none") {
                var globalToNum = Number(globalLvl);
                usrLevel = globalToNum;
                changeFactors.push("The global level change the effective level to " + globalToNum);
            }
            //-----channels check-----
            let i = 0;
            guildEntry.permissionsLevels.things.forEach(function(level) {
                if (level.includes(message.channel.id)) {
                    usrLevel = i;
                    changeFactors.push("This channel level change the effective level to " + i);
                }
                i++;
            });
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
                i = 0;
                guildEntry.permissionsLevels.things.forEach(function(level) {
                    if (level.includes(rolesInDb[0])) {
                        usrLevel = i;
                        changeFactors.push(`The role ${message.guild.roles.get(rolesInDb[0]).name} level change the effective level to ${i}`);
                    }
                    i++;
                });
            } else if (rolesInDb.length > 1) { //If there are more than 1 role with level that the user has, compare and only keep the highest one
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
                i = 0;
                guildEntry.permissionsLevels.things.forEach(function(level) {
                    if (level.includes(highestRole)) {
                        usrLevel = i;
                        changeFactors.push(`The role ${message.guild.roles.get(highestRole).name} level change the effective level to ${i}`);
                    }
                    i++;
                });
            }
            //-----users check-----
            i = 0;
            guildEntry.permissionsLevels.things.forEach(function(level) {
                if (level.includes(userId)) {
                    usrLevel = i;
                    changeFactors.push(`The user level change the effective level to ${i}`);
                }
                i++;
            });
            if (isAdmin) {
                changeFactors.push(`The administrator permissions of the user change the effective level to 2`);
                usrLevel = 2;
            }
            if (user.id === message.guild.ownerID) { //Give the level 3 of death to the guilds owners
                changeFactors.push(`The server ownership of the user change the effective level to 3`);
                usrLevel = 3;
            }
            if (hasLevel42.includes(userId)) {
                usrLevel = 42;
            }
            if (!usrLevel) {
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
                    return resolve(await message.channel.send(":x: You did not specify a user"));
                } else {
                    const effectiveLevel = getEffectiveLevel(mentionned);
                    i = 0;
                    guildEntry.permissionsLevels.things.forEach(async function(level) {
                        if (level.includes(mentionnedId)) {
                            return resolve(await message.channel.send("**" + mentionned.username + "#" + mentionned.discriminator + "** is level " + i + "\n\n```\nThe specified user effective level is " + effectiveLevel.effectiveLevel + "\n" + effectiveLevel.factorsChange.map(f => `=>${f}`).join("\n") + "```"));
                        }
                        i++;
                    });
                    if (i === 3) {
                        return resolve(await message.channel.send(":x: There's no level for this user, so their default level is 1\n\n```\nThe specified user effective level is " + effectiveLevel.effectiveLevel + "\n" + effectiveLevel.factorsChange.map(f => `=>${f}`).join("\n") + "```"));
                    }
                }
            } else if ((channel) && (!user) && (!role)) {
                var channelname = message.content.substr(channel.position + channel.length + 1).toLowerCase().trim();
                var guildChan = message.channel;
                if (channelname !== "") {
                    if (!message.guild.channels.find("name", channelname)) {
                        return resolve(await message.channel.send(":x: The channel you specified does not exist"));
                    } else {
                        guildChan = message.guild.channels.find("name", channelname);
                    }
                }
                const channelLevel = client.getPermissionsLevel(message.guild.id, guildChan.id);
                if (!channelLevel && channelLevel !== 0) { //Cuz 0 resolve to a boolean for some shit reasons
                    return resolve(await message.channel.send(":x: The channel **#" + guildChan.name + "** has not any level"));
                }
                return resolve(await message.channel.send("The channel **#" + guildChan.name + "** is level " + channelLevel));
            } else if ((role) && (!channel) && (!user)) {
                var rolename = message.content.substr(role.position + role.length + 1).trim();
                if (rolename === "") {
                    return resolve(await message.channel.send(":x: You did not specify a role name"));
                } else {
                    if (!message.guild.roles.find("name", rolename)) {
                        return resolve(await message.channel.send(":x: That role does not exist"));
                    } else {
                        var guildRole = message.guild.roles.find("name", rolename);
                        const roleLevel = client.getPermissionsLevel(message.guild.id, guildRole.id);
                        if (!roleLevel && roleLevel !== 0) {
                            return resolve(await message.channel.send(":x: The role **" + guildRole.name + "** has not any level"));
                        }
                        return resolve(await message.channel.send("The role **" + guildRole.name + "** is level " + roleLevel));
                    }
                }
            } else if ((all) && (!role) && (!user) && (!channel)) {
                var thingsLevels = new Map(),
                    guildLevel;
                thingsLevels.set("channels", [
                        [],
                        [],
                        []
                    ]),
                    thingsLevels.set("roles", [
                        [],
                        [],
                        []
                    ]),
                    thingsLevels.set("users", [
                        [],
                        [],
                        []
                    ]);
                if ((guildEntry.permissionsLevels.things[0].length === 0) && (guildEntry.permissionsLevels.things[1].length === 0) && (guildEntry.permissionsLevels.things[2].length === 0)) {
                    return await message.channel.send(":x: There is nothing that has a level on this server");
                }
                i = 0;
                guildEntry.permissionsLevels.things.forEach(async function(level) {
                    if (level.length > 0) {
                        level.forEach(function(thing) {
                            if (message.guild.roles.get(thing)) {
                                thingsLevels.get("channels")[i].push(message.guild.roles.get(thing).name);
                            } else if (message.guild.channels.get(thing)) {
                                thingsLevels.get("roles")[i].push(message.guild.channels.get(thing).name);
                            } else if (message.guild.members.get(thing)) {
                                thingsLevels.get("users")[i].push(message.guild.members.get(thing).user.username);
                            }
                        });
                    }
                    i++;
                });
                //Build the list ignoring the things without any level
                var list = [],
                    thingsTypes = ["Roles", "Channels", "Users"],
                    c = 0;
                i = 0;
                thingsLevels.forEach(function(type) {
                    type.forEach(function(level) {
                        if (level.length > 0) {
                            list.push(`${thingsTypes[c]} level ${i}: ${level}`);
                        }
                        i++;
                    });
                    i = 0;
                    c++;
                });
                if (guildEntry.globalLevel !== "none") {
                    list.push(`Server level: ${guildEntry.permissionsLevels.globalLevel}`);
                }
                guildLevel = guildEntry.permissionsLevels.globalLevel;
                const resultsPage = await client.pageResults({
                    message: message,
                    text: "Here's the list of the permissions set in your server ",
                    results: list
                });
                return resolve(await message.channel.send("Here's the list of everything that has a level on your server. Showing page `" + resultsPage.page + "`. Use `" + client.prefix + "gl -all -page 2` for example to navigate through pages.```\n" + resultsPage.results.join("\n") + "```"));
            } else if ((!role) && (!user) && (!channel) && (!all)) {
                if (guildEntry.permissionsLevels.globalLevel === "none") {
                    return resolve(await message.channel.send(":x: There is no level set for the whole server"));
                } else {
                    return resolve(await message.channel.send("This server global level is " + guildEntry.permissionsLevels.globalLevel));
                }
            }
        } catch (err) {
            console.error(err);
            reject(client.Raven.captureException(err));
        }
    })
}
exports.conf = {
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