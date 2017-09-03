const fs = require("fs-extra");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        var content = message.content;
        const user = await client.searchForParameter({
            message: message,
            parameter: "user"
        });
        const role = await client.searchForParameter({
            message: message,
            parameter: "role"
        });
        const channel = await client.searchForParameter({
            message: message,
            parameter: "channel"
        });
        message.content = content;
        const balise = message.content.indexOf("-");
        const mentionned = message.mentions.users.first();
        var tips = ["\n\n:information_source: **ProTip**:\nThere are stronger and weaker permissions, the order from strongest to weakest is \nUser > Roles > Channels > Server", "\n\n:information_source: **ProTip**:\n When setting a channel level, dont put anything after the `c` argument to apply the perms to the current channel", "\n\n:information_source: **ProTip**:\n Remember that the level 2 give access to every commands, give it only to the users you trust, and never set a channel or the server level to 2 unless you have a death wish", "\n\n:information_source: **ProTip**:\nIf a user has two roles or more with a different access level, the user access level will be the one of the highest role", "\n\n:information_source: **ProTip**:\nAs long as you have Administrator permissions, you are level 2 by default, there's no way to decrease it", "\n\n:information_source: **ProTip**:\n setLevel overwrites the targetted element(user, channel, role...) level if there is already one, so dont worry about duplicates", "\n\n:information_source: **ProTip**:\nRoles and channels levels are stored using their id, so dont worry, you can edit them as much as you want, it wont affect the level unless you delete it"];
        var randomTips = tips[Math.floor(Math.random() * tips.length)];
        const guildEntry = client.guildData.get(message.guild.id);

        function clearDuplicates(levelToSave, id) { //check every arrays if there is already a level assigned to the user/channel/role, and if there is, remove it to keep only one
            if (guildEntry.permissionsLevels.things[0].includes(id)) {
                if (levelToSave !== "0") {
                    guildEntry.permissionsLevels.things[0].splice(guildEntry.permissionsLevels.things[0].indexOf(id), 1);
                    client.guildData.set(message.guild.id, guildEntry);
                }
            }
            if (guildEntry.permissionsLevels.things[1].includes(id)) {
                if (levelToSave !== "1") {
                    guildEntry.permissionsLevels.things[1].splice(guildEntry.permissionsLevels.things[1].indexOf(id), 1);
                    client.guildData.set(message.guild.id, guildEntry);
                }
            }
            if (guildEntry.permissionsLevels.things[2].includes(id)) {
                if (levelToSave !== "2") {
                    guildEntry.permissionsLevels.things[2].splice(guildEntry.permissionsLevels.things[2].indexOf(id), 1);
                    client.guildData.set(message.guild.id, guildEntry);
                }
            }
            if (client.database.Data.global[0].thingsLevel42.includes(id)) {
                if (levelToSave !== "42") {
                    client.database.Data.global[0].thingsLevel42.splice(client.database.Data.global[0].thingsLevel42.indexOf(id), 1);
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
            }
        }
        try {
            let level;
            if (mentionned) {
                var mentionnedId = mentionned.id;
                var member = message.guild.members.get(mentionnedId);
            }
            var args = message.content.split(/\s+/gim);
            args.shift();
            args.forEach(function(arg) {
                if (!isNaN(arg)) {
                    return level = arg;
                }
            });
            if ((level !== "0") && (level !== "1") && (level !== "2") && (level !== "42")) {
                return resolve(await message.channel.send(":x: You did not specified a level or the level you specified is not an existing one, levels: 0, 1, 2" + randomTips));
            }
            if ((user) && (!role) && (!channel)) {
                if (!mentionned) {
                    return resolve(await message.channel.send(":x: You did not specified a user" + randomTips));
                }
                if (message.author.id !== "140149699486154753") {
                    if (level === "42") {
                        return resolve(await message.channel.send(":x: That level doesn't exist !"));
                    }
                }
                if (level !== "42") {
                    guildEntry.permissionsLevels.things[Number(level)].push(mentionnedId);
                    client.guildData.set(message.guild.id, guildEntry);
                    clearDuplicates(level, mentionnedId);
                    return resolve(await message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level **" + level + "**" + randomTips));
                } else {
                    client.database.Data.global[0].thingsLevel42.push(mentionnedId);
                    clearDuplicates("42", mentionnedId);
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                    return resolve(await message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level **" + level + "**" + randomTips));
                }
            } else if ((channel) && (!role) && (!user)) {
                if (level === "42") {
                    return resolve(await message.channel.send(":x: The level you specified does not exist"));
                }
                var channame = message.content.substr(channel.position + channel.length + 1);
                var channelName = channame.toLowerCase(); //remove case-sensitivty
                if (channame === "") {
                    channelName = message.channel.name;
                }
                if (!message.guild.channels.find("name", channelName)) {
                    return resolve(await message.channel.send(":x: The channel you specified doesn't exist" + randomTips));
                } else {
                    var channelId = message.guild.channels.find("name", channelName).id;
                    if (guildEntry.permissionsLevels.things[level].includes(channelId)) {
                        return resolve(await message.channel.send(":x: This channel is already level **" + level + "**"));
                    }
                    guildEntry.permissionsLevels.things[level].push(channelId);
                    client.guildData.set(message.guild.id, guildEntry);
                    clearDuplicates(level, channelId);
                    return resolve(await message.channel.send(":white_check_mark: Okay, **" + channelName + "** is now level **" + level + "**" + randomTips));
                }
            } else if ((role) && (!channel) && (!user)) {
                if (level === "42") {
                    return resolve(await message.channel.send(":x: The level you specified does not exist"));
                }
                var rolename = message.content.substr(role.position + role.length + 1);
                if (rolename === "") {
                    return resolve(await message.channel.send(":x: You did not specify a role name" + randomTips));
                }
                if (!message.guild.roles.find("name", rolename)) {
                    console.log(rolename, message.content);
                    return resolve(await message.channel.send(":x: The role you specified does not exist, remember to respect case-sensitivity" + randomTips));
                }
                var roleId = message.guild.roles.find("name", rolename).id;
                if (guildEntry.permissionsLevels.things[level].includes(roleId)) {
                    return resolve(await message.channel.send(":x: This role is already level " + level + randomTips));
                }
                guildEntry.permissionsLevels.things[level].push(roleId);
                client.guildData.set(message.guild.id, guildEntry);
                clearDuplicates(level, roleId);
                return resolve(await message.channel.send(":white_check_mark: Okay, **" + rolename + "** is now level **" + level + "**" + randomTips));
            } else if ((!user) && (!channel) && (!role)) {
                if (level === "42") {
                    return resolve(await message.channel.send(":x: The level you specified does not exist"));
                }
                if (guildEntry.permissionsLevels.globalLevel === level) {
                    return message.channel.send(":x: The server is already level " + level + randomTips);
                }
                guildEntry.permissionsLevels.globalLevel = level;
                client.guildData.set(message.guild.id, guildEntry);
                return resolve(await message.channel.send(":white_check_mark: Okay, the server is now level " + level + randomTips));
            }
        } catch (err) {
            console.error(err);
            reject(client.Raven.captureException(err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: ["sl"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'setlevel',
    parameters: '`-role`(or `-r`), `-channel`(or `-chan`/`-c`), `-user`(or `-u`)',
    description: 'Set the access level of the targetted element(role, user...). If no arguments are provided, the level will be assigned to the server',
    usage: 'setlevel 0 -u @someone',
    category: 'moderation',
    detailledUsage: '`{prefix}setlevel 2 -r Moderators` Will set the level of the role `Moderators` to 2\n`{prefix}setlevel 0 -c general` Will set the level of the channel `#general` to 0\n\n**Levels**\n`Level 0` => Cant use any commands\n`Level 1` => Can use every commands but the moderation and settings one\n`Level 2` => Can use every commands'
};