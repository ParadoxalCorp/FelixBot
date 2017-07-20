const fs = require("fs-extra");
const unirest = require("unirest");

module.exports = async (client, message) => {
        if (message.channel.type !== "dm") {
            try { //In case felix got invited while being down
                if (!client.database.Data.servers[0][message.guild.id]) {
                    client.database.Data.servers[0][message.guild.id] = {
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
                        farewellChan: ""
                    }
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
            } catch (err) {
                console.error(err);
                client.channels.get(client.errorLog).send(`A critical error occured while trying to create an entry for the guild ${message.guild.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
            }
        }
        try { //If the user is not in the db yet, add it in order to avoid any bugs later
            if (!client.database.Data.users[0][message.author.id]) {
                client.database.Data.users[0][message.author.id] = {
                    lovePoints: 0,
                    loveCooldown: 0,
                    malAccount: "",
                    blackListed: "no",
                    afk: "",
                    feedbackCooldown: ""
                }
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
        } catch (err) {
            console.error(err);
            client.channels.get(client.errorLog).send(`A critical error occured while trying to create an entry for the user ${message.author.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`);
        }
        try { //Late features check
            if (!client.database.Data.users[0][message.author.id].afk) {
                client.database.Data.users[0][message.author.id].afk = "";
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
            if (!client.database.Data.users[0][message.author.id].blackListed) {
                client.database.Data.users[0][message.author.id].blackListed = "no";
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
            if (!client.database.Data.users[0][message.author.id].feedbackCooldown) {
                client.database.Data.users[0][message.author.id].feedbackCooldown = "";
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
            if (message.channel.type !== "dm") {
                if (!client.database.Data.servers[0][message.guild.id].greetings) {
                    client.database.Data.servers[0][message.guild.id].greetings = "";
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
                if (!client.database.Data.servers[0][message.guild.id].farewell) {
                    client.database.Data.servers[0][message.guild.id].farewell = "";
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
                if (!client.database.Data.servers[0][message.guild.id].greetingsMethod) {
                    client.database.Data.servers[0][message.guild.id].greetingsMethod = "";
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
                if (!client.database.Data.servers[0][message.guild.id].greetingsChan) {
                    client.database.Data.servers[0][message.guild.id].greetingsChan = "";
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
                if (!client.database.Data.servers[0][message.guild.id].farewellChan) {
                    client.database.Data.servers[0][message.guild.id].farewellChan = "";
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
            }
        } catch (err) {
            console.error(err);
            client.channels.get(client.errorLog).send(`A critical error occured while trying to create an entry for the user ${message.author.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`);
        }
        const mentionned = message.mentions.users.first(); //Afk feature
        if (mentionned) {
            if (client.database.Data.users[0][mentionned.id]) { 
                if (client.database.Data.users[0][mentionned.id].afk) {
                    if (client.database.Data.users[0][mentionned.id].afk !== "") { //If the mentionned user hasnt set any afk status, do nothing
                        await message.channel.send({
                            embed: ({
                                color: 3447003,
                                author: {
                                    name: mentionned.username + "#" + mentionned.discriminator,
                                    icon_url: mentionned.avatarURL
                                },
                                title: mentionned.username + " is AFK:",
                                description: client.database.Data.users[0][mentionned.id].afk
                            })
                        }).catch(console.error);
                    }
                }
            } else { //To avoid errors in commands which works with mention, create a entry in case
                client.database.Data.users[0][mentionned.id] = {
                    lovePoints: 0,
                    loveCooldown: 0,
                    malAccount: "",
                    blackListed: "no",
                    afk: "",
                    feedbackCooldown: ""
                }
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });                
            }
        }
        if (message.author.bot) return;
        if (client.database.Data.users[0][message.author.id].blackListed === "yes") return; //Ignore blacklisted users
        if (message.channel.type === "dm") {
            if (!message.content.startsWith(client.database.Data.global[0].prefix)) return;
            client.prefix = client.database.Data.global[0].prefix;
            // Someone once told me that it was the best way to define args
            const args = message.content.split(/\s+/g);
            const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
            var command;
            if (client.commands.get(supposedCommand)) { //first check if its the a main command name, if not, then check if its an alias
                command = client.commands.get(supposedCommand).help.name;
            } else if (client.commands.get(client.aliases.get(supposedCommand))) {
                command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
            }
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
        if (message.content.startsWith(client.mention + " prefix")) {
            return message.channel.send("The current prefix on this server is **" + client.database.Data.servers[0][message.guild.id].prefix + "**");
        }
        if (!message.content.startsWith(client.database.Data.servers[0][message.guild.id].prefix)) return;
        client.prefix = client.database.Data.servers[0][message.guild.id].prefix;
        // Someone once told me that it was the best way to define args
        const args = message.content.split(/\s+/g);
        const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
        if ((!client.commands.get(supposedCommand)) && (!client.aliases.get(supposedCommand))) return; //Just return if the command is not found
        var command;
        if (client.commands.get(supposedCommand)) { //first check if its the a main command name, if not, then check if its an alias
            command = client.commands.get(supposedCommand).help.name;
        } else if (client.commands.get(client.aliases.get(supposedCommand))) {
            command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
        }
        //const command = client.commands.get(supposedCommand).help.name || client.commands.get(client.aliases.get(supposedCommand)).help.name; //check the default command name or one of the aliases 
        const commandFile = require(`../commands/${command}.js`);
        if (commandFile.conf.disabled !== false) {
            return message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        }
        var usrLevel;
        var isAdmin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
        var hasLevel0 = client.database.Data.servers[0][message.guild.id].thingsLevel0;
        var hasLevel1 = client.database.Data.servers[0][message.guild.id].thingsLevel1;
        var hasLevel2 = client.database.Data.servers[0][message.guild.id].thingsLevel2;
        var hasLevel42 = client.config.thingsLevel42;
        var globalLvl = client.database.Data.servers[0][message.guild.id].globalLevel; //the server level
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
                commandFile.run(client, message, args);
            } catch (err) {
                console.error(err);
                return client.channels.get(client.errorLog).send(`A critical error occured while trying to run the command ${command}\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
            }
        } else {
            return await message.channel.send(":x: You don't have the permission to use this command !");
        }
};
