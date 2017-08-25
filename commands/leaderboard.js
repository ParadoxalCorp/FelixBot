exports.run = async(client, message) => {
    try {
        var args = message.content.split(/\s+/gim);
        args.shift();
        const guildEntry = client.guildDatas.get(message.guild.id);
        if (args.length === 0) {
            if (!guildEntry.levelSystem || !guildEntry.levelSystem.enabled) {
                return await message.channel.send(":x: The level system is not enabled on this server :v");
            }
            var leaderboard = guildEntry.levelSystem.users.sort(function (a, b) {
                return a.expCount - b.expCount;
            });
            leaderboard.reverse();
            const position = function (id) {
                const userPosition = leaderboard.findIndex(function (element) {
                    return element.id === id;
                });
                if (userPosition === 0) {
                    return ":trophy:";
                } else if (userPosition === 1) {
                    return ":second_place:";
                } else if (userPosition === 2) {
                    return ":third_place:"
                } else {
                    return userPosition + 1;
                }
            }
            const checkMember = function (id) { //Check if the user is still in the server
                if (!message.guild.members.get(id)) {
                    return 'Unknown user';
                } else {
                    return client.users.get(id).username + "#" + client.users.get(id).discriminator;
                }
            }
            return await message.channel.send({
                embed: {
                    title: `${message.guild.name}'s experience leaderboard`,
                    color: 3447003,
                    description: leaderboard.slice(0, 10).map(u => `#${position(u.id)} - **${checkMember(u.id)}**\nLevel: ${u.level} | Exp: ${Math.round(u.expCount)}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${leaderboard.findIndex(function (element) {return element.id === message.author.id}) + 1}/${leaderboard.length}`
                    },
                    thumbnail: {
                        url: message.guild.iconURL
                    }
                }
            });
        } else if (args[0] === "servers") {
            const activeGuilds = client.guildDatas.filterArray(g => JSON.parse(g).levelSystem && JSON.parse(g).levelSystem.enabled && JSON.parse(g).levelSystem.public);
            var leaderboard = activeGuilds.sort(function (a, b) {
                return JSON.parse(a).levelSystem.totalExp - JSON.parse(b).levelSystem.totalExp;
            });
            leaderboard.reverse();
            if (leaderboard.length === 0) {
                return await message.channel.send(":x: Welp, there's no servers in the leaderboard yet :v");
            }
            const guildPosition = function (id) {
                const guildPos = leaderboard.findIndex(function (element) {
                    return JSON.parse(element).levelSystem.id === id;
                });
                if (guildPos === 0) {
                    return ":trophy:";
                } else if (guildPos === 1) {
                    return ":second_place:";
                } else if (guildPos === 2) {
                    return ":third_place:"
                } else {
                    return guildPos + 1;
                }
            }
            const checkGuild = function (id) {
                if (!client.guilds.get(id)) {
                    return "Unknown server";
                } else {
                    return client.guilds.get(id).name + " (" + id + ")";
                }
            }
            return await message.channel.send({
                embed: {
                    title: `Global experience leaderboard`,
                    color: 3447003,
                    description: leaderboard.slice(0, 10).map(g => `#${guildPosition(JSON.parse(g).levelSystem.id)} - **${checkGuild(JSON.parse(g).levelSystem.id)}**\nTotal experience: ${Math.round(JSON.parse(g).levelSystem.totalExp)}`).join("\n\n")
                }
            });
        } else if (args[0] === "users") {
            var leaderboard = client.userDatas.filterArray(u => JSON.parse(u).expCount && JSON.parse(u).level && JSON.parse(u).publicLevel).sort(function (a, b) {
                return JSON.parse(a).expCount - JSON.parse(b).expCount;
            });
            leaderboard.reverse();
            if (leaderboard.length === 0) {
                return await message.channel.send(":x: Welp, there's no users in the leaderboard yet :v");
            }            
            const userPosition = function (id) {
                const userPos = leaderboard.findIndex(function (element) {
                    return JSON.parse(element).id === id;
                });
                if (userPos === 0) {
                    return ":trophy:";
                } else if (userPos === 1) {
                    return ":second_place:";
                } else if (userPos === 2) {
                    return ":third_place:"
                } else {
                    return userPos + 1;
                }
            }
            const checkUser = function (id) {
                if (!client.users.get(id)) {
                    return "Unknown user";
                } else {
                    return client.users.get(id).username + "#" + client.users.get(id).discriminator;
                }
            }
            return await message.channel.send({
                embed: {
                    title: `Global users experience leaderboard`,
                    color: 3447003,
                    description: leaderboard.slice(0, 10).map(u => `#${userPosition(JSON.parse(u).id)} - **${checkUser(JSON.parse(u).id)}**\nTotal experience: ${Math.round(JSON.parse(u).expCount)}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${leaderboard.findIndex(function (element){return JSON.parse(element).id === message.author.id}) + 1}/${leaderboard.length}`
                    }
                }
            });
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
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["lb"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'leaderboard',
    description: 'Get the experience leaderboard of this server or all the servers',
    usage: 'leaderboard',
    category: 'miscellaneous',
    detailledUsage: '`{prefix}leaderboard servers` Will return the total servers xp leaderboard\n`{leaderboard}leaderboard users` Will return the users total xp leaderboard'
};
