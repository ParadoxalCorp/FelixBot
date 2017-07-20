const fs = require("fs-extra");
exports.run = async(client, message) => {
    const user = message.content.indexOf("-u"); //This command is not really well optimized atm, but it works
    const role = message.content.indexOf("-r");
    const channel = message.content.indexOf("-c");
    const balise = message.content.indexOf("-");
    const mentionned = message.mentions.users.first();
    var tips = ["\n\n:information_source: **ProTip**:\nThere are stronger and weaker permissions, the order from strongest to weakest is \nUser > Roles > Channels > Server", "\n\n:information_source: **ProTip**:\n When setting a channel level, dont put anything after the `c` argument to apply the perms to the current channel", "\n\n:information_source: **ProTip**:\n Remember that the level 2 give access to every commands, give it only to the users you trust, and never set a channel or the server level to 2 unless you have a death wish", "\n\n:information_source: **ProTip**:\nIf a user has two roles or more with a different access level, the user access level will be the one of the highest role", "\n\n:information_source: **ProTip**:\nAs long as you have Administrator permissions, you are level 2 by default, there's no way to decrease it", "\n\n:information_source: **ProTip**:\n setLevel overwrites the targetted element(user, channel, role...) level if there is already one, so dont worry about duplicates", "\n\n:information_source: **ProTip**:\nRoles and channels levels are stored using their id, so dont worry, you can edit them as much as you want, it wont affect the level unless you delete it"];
    var randomTips = tips[Math.floor(Math.random() * tips.length)];
    const guildEntry = client.database.Data.servers[0][message.guild.id];

    function clearDuplicates(levelToSave, id) { //check every arrays if there is already a level assigned to the user/channel/role, and if there is, remove it to keep only one
        if (guildEntry.thingsLevel0.indexOf(id) !== -1) {
            if (levelToSave !== "0") {
                guildEntry.thingsLevel0.splice(guildEntry.thingsLevel0.indexOf(id), 1);
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
        }
        if (guildEntry.thingsLevel1.indexOf(id) !== -1) {
            if (levelToSave !== "1") {
                guildEntry.thingsLevel1.splice(guildEntry.thingsLevel1.indexOf(id), 1);
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
        }
        if (guildEntry.thingsLevel2.indexOf(id) !== -1) {
            if (levelToSave !== "2") {
                guildEntry.thingsLevel2.splice(guildEntry.thingsLevel2.indexOf(id), 1);
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
        }
        if (client.database.Data.global[0].thingsLevel42.indexOf(id) !== -1) {
            if (levelToSave !== "42") {
                client.database.Data.global[0].thingsLevel42.splice(client.database.Data.global[0].thingsLevel42.indexOf(id), 1);
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
        }
    }
    try {
        if (mentionned) {
            var mentionnedId = mentionned.id;
            var member = message.guild.members.get(mentionnedId);
        }
        if (message.content.indexOf("0") !== -1) {
            if (message.content.indexOf("0") < balise) { //In case there are numbers in the username, channelname or rolename
                var level = "0";
            }
        }
        if (message.content.indexOf("1") !== -1) {
            if (message.content.indexOf("1") < balise) { //In case there are numbers in the username, channelname or rolename
                var level = "1";
            }
        }
        if (message.content.indexOf("2") !== -1) {
            if (message.content.indexOf("2") < balise) { //In case there are numbers in the username, channelname or rolename
                var level = "2";
            }
        }
        if (message.content.indexOf("42") !== -1) {
            if (message.content.indexOf("42") < balise) { //In case there are numbers in the username, channelname or rolename
                var level = "42";
            }
        }
        if ((message.content.indexOf("0") === -1) && (message.content.indexOf("1") === -1) && (message.content.indexOf("2") === -1) && (message.content.indexOf("42") === -1)) {
            return await message.channel.send(":x: You did not specify a level or the level you specified is not an existing one, levels: 0, 1, 2" + randomTips);
        }
        if ((user !== -1) && (role === -1) && (channel === -1)) {
            if (!mentionned) {
                return await message.channel.send(":x: You did not specify a user" + randomTips);
            }
            if (message.author.id !== "140149699486154753") {
                if ((level !== "0") && (level !== "1") && (level !== "2")) {
                    return message.channel.send(":x: That level doesn't exist !");
                } else {
                    if (level === "0") {
                        try {
                            guildEntry.thingsLevel0.push(mentionnedId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("0", mentionnedId);
                            return message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level 0" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    } else if (level === "1") {
                        try {
                            guildEntry.thingsLevel1.push(mentionnedId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("1", mentionnedId);
                            return message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level 1" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    } else if (level === "2") {
                        try {
                            guildEntry.thingsLevel2.push(mentionnedId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            return message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level 2" + randomTips);
                        } catch (err) {
                            clearDuplicates("2", mentionnedId);
                            return console.error(err);
                        }
                    }
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
            } else if (message.author.id === "140149699486154753") { //Yes, really, i told ya it was not very optimized, i'll clean that shietcode later
                if ((level !== "0") && (level !== "1") && (level !== "2") && (level !== "42")) {
                    return message.channel.send(":x: That level doesn't exist !");
                } else {
                    if (level === "0") {
                        try {
                            guildEntry.thingsLevel0.push(mentionnedId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("0", mentionnedId);
                            return message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level 0" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    } else if (level === "1") {
                        try {
                            guildEntry.thingsLevel1.push(mentionnedId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("1", mentionnedId);
                            return message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level 1" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    } else if (level === "2") {
                        try {
                            guildEntry.thingsLevel2.push(mentionnedId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("2", mentionnedId);
                            return message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level 2" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    } else if (level === "42") {
                        try {
                            client.database.Data.global[0].thingsLevel42.push(mentionnedId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("42", mentionnedId);
                            return message.channel.send(":white_check_mark: Okay, **" + mentionned.username + "** is now level 42");
                        } catch (err) {
                            return console.error(err);
                        }
                    }
                }
            }
        } else if ((user === -1) && (role === -1) && (channel !== -1)) {
            var channame = message.content.substr(channel + 3);
            var channelName = channame.toLowerCase(); //remove case-sensitivty
            if (channame !== "") {
                if (!message.guild.channels.find("name", channelName)) {
                    return await message.channel.send(":x: The channel you specified doesn't exist" + randomTips);
                } else {
                    var channelId = message.guild.channels.find("name", channelName).id;
                    if (level === "0") {
                        try {
                            if (guildEntry.thingsLevel0.indexOf(channelId) !== -1) {
                                return message.channel.send(":x: This channel is already level " + level + randomTips);
                            }
                            guildEntry.thingsLevel0.push(channelId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("0", channelId);
                            return message.channel.send(":white_check_mark: Okay, **" + channelName + "** is now level 0" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    } else if (level === "1") {
                        try {
                            if (guildEntry.thingsLevel1.indexOf(channelId) !== -1) {
                                return message.channel.send(":x: This channel is already level " + level + randomTips);
                            }
                            guildEntry.thingsLevel1.push(channelId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("1", channelId);
                            return message.channel.send(":white_check_mark: Okay, **" + channelName + "** is now level 1" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    } else if (level === "2") {
                        try {
                            if (guildEntry.thingsLevel2.indexOf(channelId) !== -1) {
                                return message.channel.send(":x: This channel is already level " + level + randomTips);
                            }
                            guildEntry.thingsLevel2.push(channelId);
                            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                                if (err) console.error(err)
                            });
                            clearDuplicates("2", channelId);
                            return message.channel.send(":white_check_mark: Okay, **" + channelName + "** is now level 2, but be careful, that means everyone can use every commands in this channel" + randomTips);
                        } catch (err) {
                            return console.error(err);
                        }
                    }
                }
            } else {
                var channelId = message.channel.id;
                if (level === "0") {
                    try {
                        if (guildEntry.thingsLevel0.indexOf(channelId) !== -1) {
                            return message.channel.send(":x: This channel is already level " + level + randomTips);
                        }
                        guildEntry.thingsLevel0.push(channelId);
                        fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                            if (err) console.error(err)
                        });
                        clearDuplicates("0", channelId);
                        return await message.channel.send(":white_check_mark: Okay, **" + channelName + "** is now level 0" + randomTips);
                    } catch (err) {
                        return console.error(err);
                    }
                } else if (level === "1") {
                    try {
                        if (guildEntry.thingsLevel1.indexOf(channelId) !== -1) {
                            return message.channel.send(":x: This channel is already level " + level + randomTips);
                        }
                        guildEntry.thingsLevel1.push(channelId);
                        fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                            if (err) console.error(err)
                        });
                        clearDuplicates("1", channelId);
                        return await message.channel.send(":white_check_mark: Okay, **" + channelName + "** is now level 1" + randomTips);
                    } catch (err) {
                        return console.error(err);
                    }
                } else if (level === "2") {
                    try {
                        if (guildEntry.thingsLevel2.indexOf(channelId) !== -1) {
                            return message.channel.send(":x: This channel is already level " + level + randomTips);
                        }
                        guildEntry.thingsLevel2.push(channelId);
                        fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                            if (err) console.error(err)
                        });
                        clearDuplicates("2", channelId);
                        return await message.channel.send(":white_check_mark: Okay, **" + channelName + "** is now level 2, but be careful, that means everyone can use every commands in this channel" + randomTips);
                    } catch (err) {
                        return console.error(err);
                    }
                }
            }
        } else if ((user === -1) && (channel === -1) && (role !== -1)) {
            var rolename = message.content.substr(role + 3);
            if (rolename === "") {
                return message.channel.send(":x: You did not specify a role name" + randomTips);
            }
            if (!message.guild.roles.find("name", rolename)) {
                return message.channel.send(":x: The role you specified does not exist, remember to respect case-sensitivity" + randomTips);
            }
            var roleId = message.guild.roles.find("name", rolename).id;
            if (level === "0") {
                try {
                    if (guildEntry.thingsLevel0.indexOf(roleId) !== -1) {
                        return message.channel.send(":x: This role is already level " + level + randomTips);
                    }
                    guildEntry.thingsLevel0.push(roleId);
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                    clearDuplicates("0", roleId);
                    return await message.channel.send(":white_check_mark: Okay, **" + rolename + "** is now level 0" + randomTips);
                } catch (err) {
                    return console.error(err);
                }
            } else if (level === "1") {
                try {
                    if (guildEntry.thingsLevel1.indexOf(roleId) !== -1) {
                        return message.channel.send(":x: This role is already level " + level + randomTips);
                    }
                    guildEntry.thingsLevel1.push(roleId);
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                    clearDuplicates("1", roleId);
                    return await message.channel.send(":white_check_mark: Okay, **" + rolename + "** is now level 1" + randomTips);
                } catch (err) {
                    return console.error(err);
                }
            } else if (level === "2") {
                try {
                    if (guildEntry.thingsLevel2.indexOf(roleId) !== -1) {
                        return await message.channel.send(":x: This role is already level " + level + randomTips);
                    }
                    guildEntry.thingsLevel2.push(roleId);
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                    clearDuplicates("2", roleId);
                    return await message.channel.send(":white_check_mark: Okay, **" + rolename + "** is now level 2" + randomTips);
                } catch (err) {
                    return console.error(err);
                }
            }
        } else if ((user === -1) && (channel === -1) && (role === -1)) {
            if (message.content.indexOf("0") !== -1) { //cuz it was using the balises, so was returning undefined when there is no balises
                level = "0";
            }
            if (message.content.indexOf("1") !== -1) {
                level = "1";
            }
            if (message.content.indexOf("2") !== -1) {
                level = "2";
            }
            if (message.content.indexOf("42") !== -1) {
                level = "42";
            }
            try {
                if (guildEntry.globalLevel === level) {
                    return message.channel.send(":x: The server is already level " + level + randomTips);
                }
                guildEntry.globalLevel = level;
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
                return await message.channel.send(":white_check_mark: Okay, the server is now level " + level + randomTips);
            } catch (err) {
                return console.error(err);
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
    aliases: ["sl"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'setlevel',
    parameters: '`-r`(role), `-c`(channel), `-u`(user)',
    description: 'Set the access level of the targetted element(role, user...). If no arguments are provided, the level will be assigned to the server',
    usage: 'setlevel 0 -u @someone',
    category: 'moderation',
    detailledUsage: '`{prefix}setlevel 2 -r Moderators` Will set the level of the role `Moderators` to 2\n`{prefix}setlevel 0 -c general` Will set the level of the channel `#general` to 0\n\n**Levels**\n`Level 0` => Cant use any commands\n`Level 1` => Can use every commands but the moderation and settings one\n`Level 2` => Can use every commands'
};
