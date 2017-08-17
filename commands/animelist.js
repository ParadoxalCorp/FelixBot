const unirest = require("unirest");
const popura = require('popura');
const fs = require("fs-extra");

exports.run = async(client, message) => {
    const config = client.database.Data.global[0];
    const malClient = popura(config.malCredentials.name, config.malCredentials.password);
    try {
        const userMessage = message;
        const mangaSearch = client.searchForParameter(message, "manga", {
            aliases: ["-manga", "-m"],
            name: "manga"
        });
        const animeSearch = client.searchForParameter(message, "anime", {
            aliases: ["-anime", "-a"],
            name: "anime"
        });
        const whitespace = message.content.indexOf(" "); //Used to determine the position of the username
        const mentionned = message.mentions.users.first();
        if ((!animeSearch) && (!mangaSearch)) {
            return await message.channel.send(":x: You didnt used any parameters");
        }
        if ((animeSearch) && (!mangaSearch)) { //To avoid triggering two search
            var username;
            if (mentionned) {
                const userEntry = client.userDatas.get(mentionned.id);
                if (userEntry.malAccount === "") {
                    return await message.channel.send(":x: The mentionned user hasn't any MyAnimeList account linked to their Discord account");
                } else {
                    username = userEntry.malAccount;
                }
            } else {
                username = message.content.substr(whitespace + 1, animeSearch.position - whitespace - 1).trim();
            }
            var animeName = message.content.substr(animeSearch.position + animeSearch.length + 1).trim();
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
                            var anime;
                            await message.edit(`Searching for the anime **${animeName}** through **${userInfo.user_name}**'s anime list`);
                            var i;
                            await malClient.searchAnimes(animeName).then(async function (results) {
                                if (!results[0]) {
                                    return anime = false;
                                }
                                var i = 1;
                                var resultsMap = "```\n";
                                resultsMap += results.map(a => `[${i++}] - ${a.title}`).join("\n");
                                if (resultsMap.length > 2045) {
                                    resultsMap = resultsMap.substr(0, 2042) + "..."
                                }                                
                                resultsMap += "```";
                                await client.awaitReply(userMessage, ":mag: Your search has returned more than one result, select one by typing a number", resultsMap).then(async(reply) => {
                                    if ((typeof results[reply.reply.content - 1] === "undefined") || (reply.reply.content - 1 < 0) || (reply.reply.content > results.length)) {
                                        if (message.guild) {
                                            if (message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) {
                                                await reply.reply.delete();
                                            }
                                        }
                                        await reply.question.delete();
                                        return anime = undefined;
                                    }
                                    anime = results[reply.reply.content - 1].title;
                                    if (message.guild) {
                                        if (message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) {
                                            await reply.reply.delete();
                                        }
                                    }
                                    await reply.question.delete();
                                })
                            })
                            if (anime === undefined) {
                                return await message.edit(":x: You did not specified a number or the number you specified is not valid");
                            }
                            if (!anime) {
                                return await message.edit(":x: I couldn't find the anime you specified");
                            }
                            const filterForAnime = animeList.filter(a => a.series_title === anime);
                            if (filterForAnime.length < 1) {
                                return await message.edit(`The user ${username} has not ${anime} in their anime list`);
                            }
                            var startDate;
                            var endDate;
                            if (filterForAnime[0].my_start_date === "0000-00-00") {
                                startDate = "Unknown";
                            } else {
                                startDate = filterForAnime[0].my_start_date;
                            }
                            if (filterForAnime[0].my_finish_date === "0000-00-00") {
                                endDate = "Unknown";
                            } else {
                                endDate = filterForAnime[0].my_finish_date;
                            }
                            return await message.edit({
                                embed: ({
                                    title: userInfo.user_name,
                                    url: `https://myanimelist.net/profile/${userInfo.user_name}`,
                                    image: {
                                        url: filterForAnime[0].series_image
                                    },
                                    fields: [{
                                            name: ":1234: **Watched Episodes**",
                                            value: filterForAnime[0].my_watched_episodes.toString(),
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
                                            value: filterForAnime[0].my_score.toString(),
                                            inline: true
                                        }
                                            ]
                                })
                            }).catch(console.error);
                        }
                    }).catch(async function (err) {
                        console.log(err);
                        return await message.edit(":x: User not found");
                    })
            });
        } else if ((mangaSearch) && (!animeSearch)) {
            var username;
            if (mentionned) {
                const userEntry = client.userDatas.get(mentionned.id);
                if (userEntry.malAccount === "") {
                    return await message.channel.send(":x: The mentionned user hasn't any MyAnimeList account linked to their Discord account");
                } else {
                    username = userEntry.malAccount;
                }
            } else {
                username = message.content.substr(whitespace + 1, mangaSearch.position - whitespace - 1).trim();
            }
            const mangaName = message.content.substr(mangaSearch.position + mangaSearch.length + 1).trim();
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
                            await message.edit(`Searching for the manga **${mangaName}** through **${userInfo.user_name}**'s anime list`);
                            var i;
                            var manga;
                            await malClient.searchAnimes(mangaName).then(async function (results) {
                                if (!results[0]) {
                                    return manga = false;
                                }
                                var i = 1;
                                var resultsMap = "```\n";
                                resultsMap += results.map(a => `[${i++}] - ${a.title}`).join("\n");
                                if (resultsMap.length > 2045) {
                                    resultsMap = resultsMap.substr(0, 2042) + "..."
                                }
                                resultsMap += "```";
                                await client.awaitReply(userMessage, ":mag: Your search has returned more than one result, select one by typing a number", resultsMap).then(async(reply) => {
                                    if ((typeof results[reply.reply.content - 1] === "undefined") || (reply.reply.content -1 < 0) || (reply.reply.content > results.length)) {
                                        if (message.guild) {
                                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                                await reply.reply.delete();
                                            }
                                        }
                                        await reply.question.delete();
                                        return manga = undefined;
                                    }
                                    manga = results[reply.reply.content - 1].title;
                                    if (message.guild) {
                                        if (message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) {
                                            await reply.reply.delete();
                                        }
                                    }
                                    await reply.question.delete();
                                })
                            })
                            if (manga === undefined) {
                                return await message.edit(":x: You did not specified a number or the number you specified is not valid");
                            }
                            if (!manga) {
                                return await message.edit(":x: I couldn't find the manga you specified");
                            }
                            const filterForManga = mangaList.filter(a => a.series_title === manga);
                            if (filterForManga.length < 1) {
                                return await message.edit(`The user ${username} has not ${manga} in their manga list`);
                            }
                            var startDate;
                            var endDate;
                            if (filterForManga[0].my_start_date === "0000-00-00") {
                                startDate = "Unknown";
                            } else {
                                startDate = filterForManga[0].my_start_date;
                            }
                            if (filterForManga[0].my_finish_date === "0000-00-00") {
                                endDate = "Unknown";
                            } else {
                                endDate = filterForManga[0].my_finish_date;
                            }
                            return await message.edit({
                                embed: ({
                                    title: userInfo.user_name,
                                    url: `https://myanimelist.net/profile/${userInfo.user_name}`,
                                    image: {
                                        url: filterForManga[0].series_image
                                    },
                                    fields: [{
                                            name: ":book: **Read Chapters**",
                                            value: filterForManga[0].my_read_chapters.toString(),
                                            inline: true
                                        }, {
                                            name: ":books: **Read Volumes**",
                                            value: filterForManga[0].my_read_volumes.toString(),
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
                                            value: filterForManga[0].my_score.toString(),
                                            inline: true
                                        }
                                            ]
                                })
                            }).catch(console.error);
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
    detailledUsage: '`{prefix}animelist Sangoku -anime Death Note` Will check if Sangoku has the anime Death Note in his anime list\n`{prefix}animelist Naruto -manga Dragon Ball` Will check if Naruto has the manga Dragon Ball in his anime list'
};
