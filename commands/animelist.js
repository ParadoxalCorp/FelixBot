const unirest = require("unirest");
const popura = require('popura');
const malClient = popura('Paradoxcorp', 'Fetyug88');
const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const userMessage = message;
        const mangaSearch = message.content.indexOf("-manga");
        const animeSearch = message.content.indexOf("-anime");
        const whitespace = message.content.indexOf(" "); //Used to determine the position of the username
        const mentionned = message.mentions.users.first();
        const userEntry = client.database.Data.users[0];
        if ((animeSearch === -1) && (mangaSearch === -1)) {
            return await message.channel.send(":x: You didnt used any parameters");
        }
        if ((animeSearch !== -1) && (mangaSearch === -1)) { //To avoid triggering two search
            var username;
            if (mentionned) {
                if (!userEntry[mentionned.id]) { //Security check, even if its in a try catch, it would cause problems to read data from a non-existing json object
                    userEntry[message.author.id] = {
                        lovePoints: 0,
                        loveCooldown: 0,
                        malAccount: ""
                    }
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
                if (userEntry[mentionned.id].malAccount === "") {
                    return await message.channel.send(":x: The mentionned user hasn't any MyAnimeList account linked to their Discord account");
                } else {
                    username = userEntry[mentionned.id].malAccount;
                }
            } else {
                username = message.content.substr(whitespace + 1, animeSearch - whitespace - 1).trim();
            }
            const animeName = message.content.substr(animeSearch + 7).trim();
            if (username === "") {
                return await message.channel.send(":x: You didnt specified any user");
            }
            if (animeName === "") {
                return await message.channel.send(":x: You didnt specified any anime");
            }
            message.channel.send("Checking if the user exist..").then(async(message) => {
                await malClient.getAnimeList(username)
                    .then(async function (res) {
                        if (res.myinfo.user_name) {
                            const userInfo = res.myinfo;
                            const animeList = res.list;
                            await message.edit(`Searching for the anime **${animeName}** through **${userInfo.user_name}'s anime list`);
                            var i;
                            for (i = 0; i < animeList.length; i++) {
                                if (animeList[i].series_title === animeName) {
                                    var startDate;
                                    var endDate;
                                    if (animeList[i].my_start_date === "0000-00-00") {
                                        startDate = "Unknown";
                                    } else {
                                        startDate = animeList[i].my_start_date;
                                    }
                                    if (animeList[i].my_finish_date === "0000-00-00") {
                                        endDate = "Unknown";
                                    } else {
                                        endDate = animeList[i].my_finish_date;
                                    }
                                    return await message.edit({
                                        embed: ({
                                            title: userInfo.user_name,
                                            url: `https://myanimelist.net/profile/${userInfo.user_name}`,
                                            image: {
                                                url: animeList[i].series_image
                                            },
                                            fields: [{
                                                    name: ":1234: **Watched Episodes**",
                                                    value: animeList[i].my_watched_episodes.toString(),
                                                    inline: true
                                        }, {
                                                    name: ":calendar: **Start Date**",
                                                    value: startDate,
                                                    inline: true
                                        }, {
                                                    name: ":calendar: **Finish Date**",
                                                    value: endDate,
                                                    inline: true
                                        }, {
                                                    name: ":star: **Score**",
                                                    value: animeList[i].my_score.toString(),
                                                    inline: true
                                        }
                                            ]
                                        })
                                    }).catch(console.error);
                                }
                            }
                            return await message.edit(":x: **" + userInfo.user_name + "** has not **" + animeName + "** in their anime list")
                        }

                    }).catch(async function (err) {
                        return await message.edit(":x: User not found");
                    })
            });
        } else if ((mangaSearch !== -1) && (animeSearch === -1)) {
            var username;
            if (mentionned) {
                if (!userEntry[mentionned.id]) { //Security check, even if its in a try catch, it would cause problems to read data from a non-existing json object
                    userEntry[message.author.id] = {
                        lovePoints: 0,
                        loveCooldown: 0,
                        malAccount: ""
                    }
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
                if (userEntry[mentionned.id].malAccount === "") {
                    return await message.channel.send(":x: The mentionned user hasn't any MyAnimeList account linked to their Discord account");
                } else {
                    username = userEntry[mentionned.id].malAccount;
                }
            } else {
                username = message.content.substr(whitespace + 1, mangaSearch - whitespace - 1).trim();
            }
            const mangaName = message.content.substr(mangaSearch + 7).trim();
            if (username === "") {
                return await message.channel.send(":x: You didnt specified any user");
            }
            if (mangaName === "") {
                return await message.channel.send(":x: You didnt specified any anime");
            }
            message.channel.send("Checking if the user exist..").then(async(message) => {
                await malClient.getMangaList(username)
                    .then(async function (res) {
                        if (res.myinfo.user_name) {
                            const userInfo = res.myinfo;
                            const mangaList = res.list;
                            await message.edit(`Searching for the manga **${mangaName}** through **${userInfo.user_name}'s anime list`);
                            var i;
                            for (i = 0; i < mangaList.length; i++) {
                                if (mangaList[i].series_title === mangaName) {
                                    var startDate;
                                    var endDate;
                                    if (mangaList[i].my_start_date === "0000-00-00") {
                                        startDate = "Unknown";
                                    } else {
                                        startDate = mangaList[i].my_start_date;
                                    }
                                    if (mangaList[i].my_finish_date === "0000-00-00") {
                                        endDate = "Unknown";
                                    } else {
                                        endDate = mangaList[i].my_finish_date;
                                    }
                                    return await message.edit({
                                        embed: ({
                                            title: userInfo.user_name,
                                            url: `https://myanimelist.net/profile/${userInfo.user_name}`,
                                            image: {
                                                url: mangaList[i].series_image
                                            },
                                            fields: [{
                                                    name: ":book: **Read Chapters**",
                                                    value: mangaList[i].my_read_chapters.toString(),
                                                    inline: true
                                        }, {
                                                    name: ":books: **Read Volumes**",
                                                    value: mangaList[i].my_read_volumes.toString(),
                                                    inline: true
                                        }, {
                                                    name: ":calendar: **Start Date**",
                                                    value: startDate,
                                                    inline: true
                                        }, {
                                                    name: ":calendar: **Finish Date**",
                                                    value: endDate,
                                                    inline: true
                                        }, {
                                                    name: ":star: **Score**",
                                                    value: mangaList[i].my_score.toString(),
                                                    inline: true
                                        }
                                            ]
                                        })
                                    }).catch(console.error);
                                }
                            }
                            return await message.edit(":x: **" + userInfo.user_name + "** has not **" + mangaName + "** in their anime list")
                        }

                    }).catch(async function (err) {
                        console.error(err);
                        return await message.edit(":x: User not found");
                    })
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
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["al"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'animelist',
    parameters: '`-manga`, `-anime`',
    description: 'Check if the provided user has a specific anime/manga in his anime list',
    usage: 'animelist username -anime Death Note',
    category: 'utility',
    detailledUsage: '`f!animelist Sangoku -anime Death Note` Will check if Sangoku has the anime Death Note in his anime list\n`f!animelist Naruto -manga Dragon Ball` Will check if Naruto has the manga Dragon Ball in his anime list'
};
