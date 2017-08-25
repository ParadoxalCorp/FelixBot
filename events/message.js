const fs = require("fs-extra");
const unirest = require("unirest");
const PersistentCollection = require('djs-collection-persistent');

module.exports = async(client, message) => {
    if (message.channel.type !== "dm") {
        try { //In case felix got invited while being down
            if (!client.guildDatas.get(message.guild.id)) {
                const defaultGuildDatas = {
                    prefix: "f!",
                    thingsLevel0: [],
                    thingsLevel1: [],
                    thingsLevel2: [],
                    globalLevel: "none",
                    updateChannel: "",
                    onJoinRole: "",
                    greetings: "",
                    farewell: "",
                    greetingsMethod: "",
                    greetingsChan: "",
                    farewellChan: "",
                    autoAssignablesRoles: [],
                    censors: []
                }
                client.guildDatas.set(message.guild.id, defaultGuildDatas);
            }
        } catch (err) {
            console.error(err);
            client.channels.get(client.errorLog).send(`A critical error occured while trying to create an entry for the guild ${message.guild.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
        }
    }
    const defaultUserDatas = {
        lovePoints: 0,
        loveCooldown: 0,
        secondLoveCooldown: 0,
        malAccount: "",
        blackListed: "no",
        afk: "",
        feedbackCooldown: 0
    }
    const mentionned = message.mentions.users.first(); //Afk feature
    if (mentionned) {
        if (client.userDatas.get(mentionned.id)) {
            if (client.userDatas.get(mentionned.id).afk) {
                if (client.userDatas.get(mentionned.id).afk !== "") { //If the mentionned user hasnt set any afk status, do nothing
                    await message.channel.send({
                        embed: ({
                            color: 3447003,
                            author: {
                                name: mentionned.username + "#" + mentionned.discriminator + " is AFK",
                                icon_url: mentionned.avatarURL
                            },
                            description: client.userDatas.get(mentionned.id).afk
                        })
                    }).catch(console.error);
                }
            }
        } else { //To avoid errors in commands which works with mention, create a entry in case
            client.userDatas.set(mentionned.id, defaultUserDatas);
        }
    }
    if (message.author.bot) return;
    //Tags
    if (message.channel.type !== "dm") {
        if (message.content.startsWith(client.guildDatas.get(message.guild.id).prefix + "t ")) {
            const tagCommand = message.content.substr(client.guildDatas.get(message.guild.id).prefix.length + 2).trim();
            if (!client.tagDatas.filter(t => (JSON.parse(t).privacy === "Global") || (JSON.parse(t).privacy === "Server-wide" && JSON.parse(t).guild === message.guild.id) || (JSON.parse(t).author === message.author.id)).get(tagCommand)) {
                return await message.channel.send(":x: That tag does not exist");
            }
            if (!client.userDatas.get(message.author.id)) { //Once the tag is confirmed
                client.userDatas.set(message.author.id, defaultUserDatas);
            }
            if ((client.userDatas.get(message.author.id).blackListed === "yes") && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users
            return await message.channel.send(client.tagDatas.get(tagCommand).content);
        }
    }
    //Commands
    if (message.channel.type === "dm") {
        if (!message.content.startsWith(client.database.Data.global[0].prefix)) return;
        client.prefix = client.database.Data.global[0].prefix;
        // Someone once told me that it was the best way to define args
        const args = message.content.split(/\s+/g);
        const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
        var command;
        if (client.commands.get(supposedCommand)) { //first check if its the main command name, if not, then check if its an alias
            command = client.commands.get(supposedCommand).help.name;
        } else if (client.commands.get(client.aliases.get(supposedCommand))) {
            command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
        }
        if (!command) return;
        if (!client.userDatas.get(message.author.id)) { //Once the command is confirmed
            client.userDatas.set(message.author.id, defaultUserDatas);
        }
        if ((client.userDatas.get(message.author.id).blackListed === "yes") && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users
        const commandFile = require(`../commands/${command}.js`);
        if (commandFile.conf.guildOnly) {
            return await message.channel.send(":x: This command can only be used in a guild");
        }
        if (commandFile.conf.disabled !== false) {
            return await message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        }
        try {
            return commandFile.run(client, message, args);
        } catch (err) {
            console.error(err);
            return client.channels.get(client.errorLog).send(`A critical error occured while trying to run the command ${command}\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
        }
    }
    const guildEntry = client.guildDatas.get(message.guild.id);
    if (client.userDatas.get(message.author.id) && guildEntry.levelSystem && guildEntry.levelSystem.enabled) { //Activity level system
        if (!client.talkedRecently.has(message.author.id)) {
            const expGain = Math.round(1 * message.content.length / 4);
            const userEntry = client.userDatas.get(message.author.id);
            const getCurrentLevel = function (level, exp) {
                const exponent = 2;
                const baseXP = 100;
                const requiredXp = Math.floor(baseXP * (level ** exponent));
                if (exp >= requiredXp) {
                    return level + 1;
                } else {
                    return level;
                }
            }
            if (!userEntry.expCount) { //That stuff is for global xp
                userEntry.expCount = expGain;
                userEntry.level = getCurrentLevel(0, expGain);
            } else {
                userEntry.expCount = userEntry.expCount + expGain;
                userEntry.level = getCurrentLevel(userEntry.level, userEntry.expCount + expGain);
            }
            if (!userEntry.id) {
                userEntry.id = message.author.id;
            }
            client.userDatas.set(message.author.id, userEntry);
            if (guildEntry.levelSystem.users.filter(u => u.id === message.author.id).length === 0) {
                const curLevel = getCurrentLevel(0, expGain);
                if (curLevel !== 0) {
                    var wonRoles = "";
                    if (guildEntry.levelSystem.roles.filter(r => r.atLevel === curLevel)) {
                        if (message.guild.member(client.user).hasPermission("MANAGE_ROLES")) {
                            const roles = guildEntry.levelSystem.roles.filter(r => r.atLevel === curLevel);
                            if (roles.length !== 0) {
                                roles.forEach(function (role) {
                                    const guildRole = message.guild.roles.get(role.id);
                                    if (!guildRole) { //Automatically remove deleted roles from the list
                                        const rolePos = guildEntry.levelSystem.roles.findIndex(function (element) {
                                            return element.id === role.id;
                                        });
                                        guildEntry.levelSystem.roles.splice(rolePos, 1);
                                    } else {
                                        message.member.addRole(guildRole);
                                    }
                                });
                                wonRoles += "and won the role(s) " + guildEntry.levelSystem.roles.filter(r => r.atLevel === curLevel).map(r => `**${message.guild.roles.get(r.id).name}**`).join(", ");
                            }
                        }
                    }
                    if (message.guild.member(client.user).hasPermission("SEND_MESSAGES")) {
                        if (guildEntry.levelSystem.levelUpNotif) {
                            if (guildEntry.levelSystem.levelUpNotif === "channel") {
                                await message.channel.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + 1 + "**");
                            } else {
                                try {
                                    await message.author.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + 1 + "**")
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }
                    }
                }
                guildEntry.levelSystem.users.push({
                    id: message.author.id,
                    expCount: expGain,
                    level: getCurrentLevel(0, expGain)
                });
                guildEntry.levelSystem.totalExp = expGain;
                client.guildDatas.set(message.guild.id, guildEntry);
            } else {
                const userPos = guildEntry.levelSystem.users.findIndex(function (element) {
                    return element.id === message.author.id;
                });
                const userEntry = client.userDatas.get(message.author.id);
                if (userEntry.publicLevel === undefined) {
                    userEntry.publicLevel = true;
                    client.userDatas.set(message.author.id, userEntry);
                }
                const curLevel = getCurrentLevel(guildEntry.levelSystem.users[userPos].level, guildEntry.levelSystem.users[userPos].expCount + expGain);
                if (curLevel !== guildEntry.levelSystem.users[userPos].level) {
                    guildEntry.levelSystem.users[userPos].level = curLevel;
                    var wonRoles = "";
                    if (guildEntry.levelSystem.roles.filter(r => r.atLevel === curLevel)) {
                        if (message.guild.member(client.user).hasPermission("MANAGE_ROLES")) {
                            const roles = guildEntry.levelSystem.roles.filter(r => r.atLevel === curLevel);
                            if (roles.length !== 0) {
                                roles.forEach(function (role) {
                                    const guildRole = message.guild.roles.get(role.id);
                                    if (!guildRole) { //Automatically remove deleted roles from the list                        
                                        const rolePos = guildEntry.levelSystem.roles.findIndex(function (element) {
                                            return element.id === role.id;
                                        });
                                        guildEntry.levelSystem.roles.splice(rolePos, 1);
                                    } else {
                                        message.member.addRole(guildRole);
                                    }
                                });
                                wonRoles += "and won the role(s) " + guildEntry.levelSystem.roles.filter(r => r.atLevel === curLevel).map(r => `**${message.guild.roles.get(r.id).name}**`).join(", ");
                            }
                        }
                    }
                    if (message.guild.member(client.user).hasPermission("SEND_MESSAGES")) {
                        if (guildEntry.levelSystem.levelUpNotif) {
                            if (guildEntry.levelSystem.levelUpNotif === "channel") {
                                await message.channel.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + curLevel + "** " + wonRoles);
                            } else {
                                try {
                                    await message.author.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + curLevel + "**" + wonRoles);
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }
                    }
                }
                guildEntry.levelSystem.users[userPos].expCount = guildEntry.levelSystem.users[userPos].expCount + expGain;
                guildEntry.levelSystem.totalExp = guildEntry.levelSystem.totalExp + expGain;
                client.guildDatas.set(message.guild.id, guildEntry);
            }
        }
        // Adds the user to the set so that the spam wont be counted
        if (message.author.id !== "140149699486154753") {
            client.talkedRecently.add(message.author.id);
            setTimeout(() => {
                client.talkedRecently.delete(message.author.id);
            }, 30000);
        }
    }
    if (message.content.startsWith(`<@${client.user.id}>`)) {
        const request = message.content.substr(client.mention.length).trim();
        if (request === "prefix") {
            return message.channel.send("The current prefix on this server is **" + guildEntry.prefix + "**");
        } else if (request === "help") {
            if (message.guild) {
                return await message.channel.send("Here's the commands list, you can see the detailled help of a command using `" + guildEntry.prefix + "help commandname`\n\n" + client.overallHelp);
            } else {
                return await message.channel.send("Here's the commands list, you can see the detailled help of a command using `" + client.database.Data.global[0].prefix + "help commandname`\n\n" + client.overallHelp);
            }
        }
    }
    if (!message.content.startsWith(guildEntry.prefix)) return;
    client.getLevel = function (id) { //Check what level has the targetted element
        if (guildEntry.thingsLevel0.indexOf(id) !== -1) {
            return guildEntry.thingsLevel0;
        }
        if (guildEntry.thingsLevel1.indexOf(id) !== -1) {
            return guildEntry.thingsLevel1;
        }
        if (guildEntry.thingsLevel2.indexOf(id) !== -1) {
            return guildEntry.thingsLevel2;
        }
        return false; //If the targetted element has not any level
    }
    client.prefix = guildEntry.prefix;
    // Someone once told me that it was the best way to define args
    const args = message.content.split(/\s+/g);
    const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
    if ((!client.commands.get(supposedCommand)) && (!client.aliases.get(supposedCommand))) return; //Just return if the command is not found
    if (!client.userDatas.get(message.author.id)) { //Once the command is confirmed
        client.userDatas.set(message.author.id, defaultUserDatas);
    }
    if ((client.userDatas.get(message.author.id).blackListed === "yes") && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users
    var command;
    if (client.commands.get(supposedCommand)) { //first check if its the a main command name, if not, then check if its an alias
        command = client.commands.get(supposedCommand).help.name;
    } else if (client.commands.get(client.aliases.get(supposedCommand))) {
        command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
    }
    const commandFile = require(`../commands/${command}.js`);
    if (commandFile.conf.disabled !== false) {
        return message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
    }
    var usrLevel;
    var isAdmin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
    var hasLevel0 = guildEntry.thingsLevel0;
    var hasLevel1 = guildEntry.thingsLevel1;
    var hasLevel2 = guildEntry.thingsLevel2;
    var hasLevel42 = client.config.thingsLevel42;
    var globalLvl = guildEntry.globalLevel; //the server level
    var userId = message.author.id;
    //----global check----                     //The following checks are just to determine the user access level by using the execution order
    if (globalLvl !== "none") {
        var globalToNum = Number(globalLvl);
        usrLevel = globalToNum;
    }
    //-----channels check-----
    if (hasLevel0.indexOf(message.channel.id) !== -1) {
        usrLevel = 0;
    }
    if (hasLevel1.indexOf(message.channel.id) !== -1) {
        usrLevel = 1;
    }
    if (hasLevel2.indexOf(message.channel.id) !== -1) {
        usrLevel = 2;
    }
    //-----roles check-----
    var rolesInDb = [] //Array in case there are more than 1 role with level that the user has
    var highestRole = "none";
    for (var [key, value] of message.guild.members.get(message.author.id).roles) {
        if ((hasLevel0.indexOf(key) !== -1) || (hasLevel1.indexOf(key) !== -1) || (hasLevel2.indexOf(key) !== -1)) {
            rolesInDb.push(key);
        }
    }
    if (rolesInDb.length === 1) {
        highestRole = rolesInDb[0];
        if (hasLevel0.indexOf(rolesInDb[0]) !== -1) {
            usrLevel = 0;
        }
        if (hasLevel1.indexOf(rolesInDb[0]) !== -1) {
            usrLevel = 1;
        }
        if (hasLevel2.indexOf(rolesInDb[0]) !== -1) {
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
            usrLevel = 0;
        }
        if (hasLevel1.indexOf(highestRole) !== -1) {
            usrLevel = 1;
        }
        if (hasLevel2.indexOf(highestRole) !== -1) {
            usrLevel = 2;
        }
    }
    //-----users check-----
    if (hasLevel0.indexOf(userId) !== -1) {
        usrLevel = 0;
    }
    if (hasLevel1.indexOf(userId) !== -1) {
        usrLevel = 1;
    }
    if (hasLevel2.indexOf(userId) !== -1) {
        usrLevel = 2;
    }
    if (isAdmin) {
        usrLevel = 2;
    }
    if (message.author.id === message.guild.ownerID) { //Give the level 3 of death to the guilds owners
        usrLevel = 3;
    }
    if (hasLevel42.indexOf(userId) !== -1) {
        usrLevel = 42;
    }
    if ((!isAdmin) && (hasLevel0.indexOf(userId) === -1) && (hasLevel1.indexOf(userId) === -1) && (hasLevel2.indexOf(userId) === -1) && (hasLevel42.indexOf(userId) === -1) && (hasLevel0.indexOf(message.channel.id) === -1) && (hasLevel1.indexOf(message.channel.id) === -1) && (hasLevel2.indexOf(message.channel.id) === -1) && (globalLvl === "none") && (hasLevel0.indexOf(highestRole) === -1) && (hasLevel1.indexOf(highestRole) === -1) && (hasLevel2.indexOf(highestRole) === -1) && (message.author.id !== message.guild.ownerID)) {
        usrLevel = 1; //If there is no level set for this user/channel/server/role, give the user the default level
    }
    if (usrLevel >= commandFile.conf.permLevel) { //If the user level is higher or equal to the requested command level, then run the command
        try {
            client.cmdsUsed++;
            client.cmdsLogs += `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] Command ${command} triggered, current memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1000).toFixed(2)}MB\n`
            await commandFile.run(client, message, args);
            client.cmdsLogs += `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] new memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1000).toFixed(2)}MB\n`
        } catch (err) {
            console.error(err);
            return client.channels.get(client.errorLog).send(`A critical error occured while trying to run the command ${command}\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
        }
    } else {
        return await message.channel.send(":x: You don't have the permission to use this command !");
    }
};
