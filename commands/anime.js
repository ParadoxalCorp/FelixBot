const unirest = require('unirest');
const popura = require('popura');
const malClient = popura('Paradoxcorp', 'Fetyug88');
const malScraper = require('mal-scraper');

exports.run = async(client, message) => {
    try {
        const whitespace = message.content.indexOf(" ");
        if (whitespace === -1) {
            return await message.channel.send(":x: You did not enter an anime to search, correct syntax => `" + client.prefix + client.commands.get(this.help.name).help.name + " -a Anime Name`");
        }
        var animeName = message.content.substr(whitespace + 1).trim();
        const userMessage = message; //Keep a way to get info from the triggering message
        await message.channel.send("Searching for " + animeName + "...").then(async(message) => {
            try {
                await malClient.searchAnimes(animeName)
                    .then(async function (res) {
                        if (!res[0]) {
                            return message.edit(":x: Your search did not returned any result");
                        }
                        var title, //Stuff that will get edited by conditions to avoid as much as possible embed errors
                            episodes,
                            score,
                            type,
                            status,
                            startDate,
                            endDate,
                            studios = "lol",
                            notes,
                            popularity,
                            ranking,
                            members,
                            genres = "lol",
                            synopsis,
                            detailsLink,
                            selectedAnime = res[0];
                        if (res.length > 1) {
                            var resultList;
                            var i;
                            var replyNumber;
                            for (i = 0; i < res.length; i++) {
                                resultList += `[${i}] ${res[i].title}\n`;
                            }
                            resultList = resultList.replace(/undefined/gim, "");
                            Promise.resolve(client.awaitReply(message, ":mag: Your search has returned more than one result, select one by typing a number", "```\n" + resultList + "```")).then(async(reply) => {
                                if ((Number(reply) === undefined) || (Number(reply) >= res.length) || (Number(reply) < 0) || (!reply)) {
                                    return await message.channel.send(":x: You did not enter a whole number or the number you specified is not valid");
                                }
                                selectedAnime = res[reply];
                                if (selectedAnime === undefined) {
                                    return await message.channel.send(":x: You did not enter a number");
                                }
                                await malScraper.getInfoFromName(selectedAnime.title).then((anime) => {
                                    if (anime.genres.length !== 0) {
                                        genres = anime.genres.toString();
                                    } else {
                                        genres = "Unknown";
                                    }
                                    if (anime.detailsLink) {
                                        detailsLink = anime.detailsLink;
                                    } else {
                                        detailsLink = "https://myanimelist.net/"
                                    }
                                    if (anime.studios.length !== 0) {
                                        studios = anime.studios.toString();
                                    } else {
                                        studios = "Unknown";
                                    }
                                    if (anime.statistics.count !== "0") {
                                        notes = anime.statistics.score.count;
                                    } else {
                                        notes = "None";
                                    }
                                    if (anime.statistics.popularity) {
                                        popularity = anime.statistics.popularity;
                                    } else {
                                        popularity = "None";
                                    }
                                    if (anime.statistics.members !== "0") {
                                        members = anime.statistics.members;
                                    } else {
                                        members = "None";
                                    }
                                    if (anime.statistics.ranking) {
                                        ranking = anime.statistics.ranking;
                                    } else {
                                        ranking = "None";
                                    }
                                }).catch((err) => {
                                    if (err) {
                                        message.channel.send(":x: An error occured");
                                        console.log("triggered");
                                        return console.error(err);
                                    }
                                })
                                if (selectedAnime.title) {
                                    title = selectedAnime.title;
                                } else {
                                    title = "None";
                                }
                                if (selectedAnime.episodes !== undefined) {
                                    if (res[0].episodes === 0) {
                                        episodes = "Unknown";
                                    } else {
                                        episodes = selectedAnime.episodes.toString();
                                    }
                                } else {
                                    episodes = "None";
                                }
                                if (selectedAnime.score !== undefined) {
                                    if (selectedAnime.score === 0) {
                                        score = "0";
                                    } else {
                                        score = `${selectedAnime.score.toString()}`;
                                    }
                                } else {
                                    score = "None";
                                }
                                if (selectedAnime.type) {
                                    type = selectedAnime.type;
                                } else {
                                    type = "None";
                                }
                                if (selectedAnime.status) {
                                    status = selectedAnime.status;
                                } else {
                                    status = "None";
                                }
                                if (selectedAnime.start_date) {
                                    startDate = selectedAnime.start_date.replace(/-/g, "/");
                                } else {
                                    startDate = "Unknown";
                                }
                                if (selectedAnime.end_date) {
                                    var formatDate = selectedAnime.end_date.replace(/-/g, "/");
                                    if (formatDate === "0000/00/00") {
                                        endDate = "Unknown";
                                    } else {
                                        endDate = formatDate;
                                    }
                                } else {
                                    endDate = "Unknown";
                                }
                                if (selectedAnime.synopsis) {
                                    if (selectedAnime.synopsis.length > 1024) {
                                        var extractFirstPart = res[0].synopsis.substr(0, 1021);
                                        var cleanSynopsis = extractFirstPart.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, "");
                                        synopsis = cleanSynopsis + "..";
                                    } else {
                                        var cleanSynopsis = res[0].synopsis.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, "");
                                        synopsis = cleanSynopsis;
                                    }
                                } else {
                                    synopsis = "None";
                                }
                                if (synopsis.length > 1024) {
                                    synopsis = synopsis.substr(0, 1021) + "..";
                                }
                                return await message.channel.send({
                                    embed: {
                                        title: title,
                                        url: detailsLink,
                                        image: {
                                            url: res[0].image
                                        },
                                        fields: [{
                                                name: ":1234: Episodes",
                                                value: episodes,
                                                inline: true
                            }, {
                                                name: ":star: Score",
                                                value: score,
                                                inline: true
                            }, {
                                                name: ":open_file_folder: Genres",
                                                value: genres,
                                                inline: true
                            }, {
                                                name: ":film_frames: Studios",
                                                value: studios,
                                                inline: true
                            }, {
                                                name: ":projector: Type",
                                                value: type,
                                                inline: true
                            }, {
                                                name: ":tv: Status",
                                                value: status,
                                                inline: true
                            }, {
                                                name: ":calendar: Start Date",
                                                value: startDate,
                                                inline: true
                            }, {
                                                name: ":calendar: End Date",
                                                value: endDate,
                                                inline: true
                            }, {
                                                name: ":notepad_spiral: Synopsis",
                                                value: synopsis,
                            }
                            ],
                                        footer: {
                                            text: "Notes count: " + notes + " Popularity: " + popularity + " Members: " + members + " Ranking: " + ranking
                                        }
                                    }
                                }).catch(console.error);
                            });
                        } else {
                            await malScraper.getInfoFromName(selectedAnime.title).then((anime) => {
                                if (anime.genres.length !== 0) {
                                    genres = anime.genres.toString();
                                } else {
                                    genres = "Unknown";
                                }
                                if (anime.detailsLink) {
                                    detailsLink = anime.detailsLink;
                                } else {
                                    detailsLink = "https://myanimelist.net/"
                                }
                                if (anime.studios.length !== 0) {
                                    studios = anime.studios.toString();
                                } else {
                                    studios = "Unknown";
                                }
                                if (anime.statistics.count !== "0") {
                                    notes = anime.statistics.score.count;
                                } else {
                                    notes = "None";
                                }
                                if (anime.statistics.popularity) {
                                    popularity = anime.statistics.popularity;
                                } else {
                                    popularity = "None";
                                }
                                if (anime.statistics.members !== "0") {
                                    members = anime.statistics.members;
                                } else {
                                    members = "None";
                                }
                                if (anime.statistics.ranking) {
                                    ranking = anime.statistics.ranking;
                                } else {
                                    ranking = "None";
                                }
                            }).catch((err) => {
                                if (err) {
                                    message.channel.send(":x: An error occured");
                                    console.log("triggered");
                                    return console.error(err);
                                }
                            })
                            if (selectedAnime.title) {
                                title = selectedAnime.title;
                            } else {
                                title = "None";
                            }
                            if (selectedAnime.episodes !== undefined) {
                                if (res[0].episodes === 0) {
                                    episodes = "Unknown";
                                } else {
                                    episodes = selectedAnime.episodes.toString();
                                }
                            } else {
                                episodes = "None";
                            }
                            if (selectedAnime.score !== undefined) {
                                if (selectedAnime.score === 0) {
                                    score = "0";
                                } else {
                                    score = `${selectedAnime.score.toString()}`;
                                }
                            } else {
                                score = "None";
                            }
                            if (selectedAnime.type) {
                                type = selectedAnime.type;
                            } else {
                                type = "None";
                            }
                            if (selectedAnime.status) {
                                status = selectedAnime.status;
                            } else {
                                status = "None";
                            }
                            if (selectedAnime.start_date) {
                                startDate = selectedAnime.start_date.replace(/-/g, "/");
                            } else {
                                startDate = "Unknown";
                            }
                            if (selectedAnime.end_date) {
                                var formatDate = selectedAnime.end_date.replace(/-/g, "/");
                                if (formatDate === "0000/00/00") {
                                    endDate = "Unknown";
                                } else {
                                    endDate = formatDate;
                                }
                            } else {
                                endDate = "Unknown";
                            }
                            if (selectedAnime.synopsis) {
                                if (selectedAnime.synopsis.length > 1024) {
                                    var extractFirstPart = res[0].synopsis.substr(0, 1021);
                                    var cleanSynopsis = extractFirstPart.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, "");
                                    synopsis = cleanSynopsis + ".."
                                } else {
                                    var cleanSynopsis = res[0].synopsis.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, "");
                                    synopsis = cleanSynopsis;
                                }
                            } else {
                                synopsis = "None";
                            }
                            return await message.edit({
                                embed: {
                                    title: title,
                                    url: detailsLink,
                                    image: {
                                        url: res[0].image
                                    },
                                    fields: [{
                                            name: ":1234: Episodes",
                                            value: episodes,
                                            inline: true
                            }, {
                                            name: ":star: Score",
                                            value: score,
                                            inline: true
                            }, {
                                            name: ":open_file_folder: Genres",
                                            value: genres,
                                            inline: true
                            }, {
                                            name: ":film_frames: Studios",
                                            value: studios,
                                            inline: true
                            }, {
                                            name: ":projector: Type",
                                            value: type,
                                            inline: true
                            }, {
                                            name: ":tv: Status",
                                            value: status,
                                            inline: true
                            }, {
                                            name: ":calendar: Start Date",
                                            value: startDate,
                                            inline: true
                            }, {
                                            name: ":calendar: End Date",
                                            value: endDate,
                                            inline: true
                            }, {
                                            name: ":notepad_spiral: Synopsis",
                                            value: synopsis,
                            }
                            ],
                                    footer: {
                                        text: "Notes count: " + notes + " Popularity: " + popularity + " Members: " + members + " Ranking: " + ranking
                                    }
                                }
                            }).catch(console.error);
                        }
                    }).catch(err => console.error(err));
            } catch (err) {
                await message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. If you want to learn more about it, feel free to join the support server");
                return console.error(err);
            }
        });
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'anime',
    description: 'Search for the specified anime through MyAnimeList',
    usage: 'anime One Piece',
    category: 'utility',
};
