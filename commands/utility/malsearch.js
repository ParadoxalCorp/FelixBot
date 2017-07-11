const unirest = require('unirest');
const popura = require('popura');
const malClient = popura('Paradoxcorp', 'Fetyug88');
const malScraper = require('mal-scraper');

exports.run = async(client, message) => {
        try {
            var animeSearch = message.content.indexOf("-a");
            var userSearch = message.content.indexOf("-u");
            var mangaSearch = message.content.indexOf("-m");
            if ((animeSearch !== -1) && (userSearch === -1) && (mangaSearch === -1)) {
                var supposedAnimeName = message.content.substr(animeSearch + 3);
                if (supposedAnimeName === "") {
                    return await message.channel.send(":x: You did not enter an anime to search, correct syntax => `" + prefix + malSearch.commandname[0] + " -a Anime Name`");
                }
                var animeName = supposedAnimeName.trim();
                try {
                    await malClient.searchAnimes(animeName)
                        .then(async function (res) {
                            if (!res[0]) {
                                return message.channel.send(":x: Your search did not returned any result");
                            }
                            var title; //Stuff that will get edited by conditions to avoid as much as possible embed errors
                            var episodes;
                            var score;
                            var type;
                            var status;
                            var startDate;
                            var endDate;
                            var studios = "lol";
                            var notes;
                            var popularity;
                            var ranking;
                            var members;
                            var genres = "lol";
                            var synopsis;
                            var detailsLink;
                            await malScraper.getInfoFromName(res[0].title).then((anime) => {
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
                            if (res[0].title) {
                                title = res[0].title;
                            } else {
                                title = "None";
                            }
                            if (res[0].episodes !== undefined) {
                                if (res[0].episodes === 0) {
                                    episodes = "Unknown";
                                } else {
                                    episodes = res[0].episodes.toString();
                                }
                            } else {
                                episodes = "None";
                            }
                            if (res[0].score !== undefined) {
                                if (res[0].score === 0) {
                                    score = "0";
                                } else {
                                    score = `${res[0].score.toString()}`;
                                }
                            } else {
                                score = "None";
                            }
                            if (res[0].type) {
                                type = res[0].type;
                            } else {
                                type = "None";
                            }
                            if (res[0].status) {
                                status = res[0].status;
                            } else {
                                status = "None";
                            }
                            if (res[0].start_date) {
                                startDate = res[0].start_date.replace(/-/g, "/");
                            } else {
                                startDate = "Unknown";
                            }
                            if (res[0].end_date) {
                                var formatDate = res[0].end_date.replace(/-/g, "/");
                                if (formatDate === "0000/00/00") {
                                    endDate = "Unknown";
                                } else {
                                    endDate = formatDate;
                                }
                            } else {
                                endDate = "Unknown";
                            }
                            if (res[0].synopsis) {
                                if (res[0].synopsis.length > 1024) {
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
                        }).catch(err => console.error(err));
                } catch (err) {
                    await message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. If you want to learn more about it, feel free to join the support server");
                    return console.error(err);
                }
            } else if ((mangaSearch !== -1) && (animeSearch === -1) && (userSearch === -1)) {
                var supposedMangaName = message.content.substr(mangaSearch + 3);
                if (supposedMangaName === "") {
                    return await message.channel.send(":x: You did not enter an manga to search, correct syntax => `" + prefix + malSearch.commandname[0] + " -a Manga Name`");
                }
                var mangaName = supposedMangaName.trim();
                try {
                    await malClient.searchMangas(mangaName)
                        .then(async function (res) {
                            if (!res[0]) {
                                return await message.channel.send(":x: Your search did not returned any result");
                            }
                            var title; //Stuff that will get edited by conditions to avoid as much as possible embed errors
                            var chapters;
                            var volumes;
                            var score;
                            var type;
                            var status;
                            var startDate;
                            var endDate;
                            var synopsis;
                            if (res[0].title) {
                                title = res[0].title;
                            } else {
                                title = "None";
                            }
                            if (res[0].chapters !== undefined) {
                                if (res[0].episodes === 0) {
                                    chapters = "Unknown";
                                } else {
                                    chapters = res[0].chapters.toString();
                                }
                            } else {
                                chapters = "None";
                            }
                            if (res[0].volumes !== undefined) {
                                if (res[0].volumes === 0) {
                                    volumes = "Unknown";
                                } else {
                                    volumes = res[0].volumes.toString();
                                }
                            } else {
                                volumes = "None";
                            }
                            if (res[0].score !== undefined) {
                                if (res[0].score === 0) {
                                    score = "0";
                                } else {
                                    score = `${res[0].score.toString()}`;
                                }
                            } else {
                                score = "None";
                            }
                            if (res[0].type) {
                                type = res[0].type;
                            } else {
                                type = "None";
                            }
                            if (res[0].status) {
                                status = res[0].status;
                            } else {
                                status = "None";
                            }
                            if (res[0].start_date) {
                                startDate = res[0].start_date.replace(/-/g, "/");
                            } else {
                                startDate = "Unknown";
                            }
                            if (res[0].end_date) {
                                var formatDate = res[0].end_date.replace(/-/g, "/");
                                if (formatDate === "0000/00/00") {
                                    endDate = "Unknown";
                                } else {
                                    endDate = formatDate;
                                }
                            } else {
                                endDate = "Unknown";
                            }
                            if (res[0].synopsis) {
                                if (res[0].synopsis.length > 1024) {
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
                            return await message.channel.send({
                                embed: {
                                    title: title,
                                    image: {
                                        url: res[0].image
                                    },
                                    fields: [{
                                            name: ":book: Chapters",
                                            value: chapters,
                                            inline: true
                            }, {
                                            name: ":books: Volumes",
                                            value: volumes,
                                            inline: true
                            }, {
                                            name: ":star: Score",
                                            value: score,
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
                                    timestamp: new Date()
                                }
                            }).catch(console.error);
                        }).catch(err => console.error(err));
                } catch (err) {
                    await message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. If you want to learn more about it, feel free to join the support server");
                    return console.error(err);
                }
            } else if ((userSearch !== -1) && (mangaSearch === -1) && (animeSearch === -1)) {
                var supposedUsername = message.content.substr(userSearch + 3);
                var mentionned = message.mentions.users.first();
                if (supposedUsername === "") {
                    return await message.channel.send(":x: You didnt specify any user to search");
                }
                var username = supposedUsername.trim();
                try {
                    await malClient.getAnimeList(username)
                        .then(async function (res) {
                            if (!res) {
                                return message.channel.send(":x: User not found");
                            }
                            var malUser = res.myinfo;
                            return await message.channel.send({
                                embed: {
                                    title: "MyAnimeList",
                                    url: "https://myanimelist.net/",
                                    fields: [{
                                        name: ":bust_in_silhouette: Username",
                                        value: malUser.user_name,
                                        inline: true
                            }, {
                                        name: ":tv: Watching",
                                        value: malUser.user_watching.toString() + " anime(s)",
                                        inline: true
                            }, {
                                        name: ":white_check_mark: Completed",
                                        value: malUser.user_completed.toString() + " anime(s)",
                                        inline: true
                            }, {
                                        name: ":eyes: On hold",
                                        value: malUser.user_onhold.toString() + " anime(s)",
                                        inline: true
                            }, {
                                        name: ":x: Dropped",
                                        value: malUser.user_dropped.toString() + " anime(s)",
                                        inline: true
                            }, {
                                        name: ":notebook: Planned",
                                        value: malUser.user_plantowatch.toString() + " anime(s)",
                                        inline: true
                            }, {
                                        name: ":date: Days spent watching",
                                        value: malUser.user_days_spent_watching.toString(),
                                        inline: true
                            }, {
                                        name: ":link: Profile",
                                        value: `[${malUser.user_name}'s profile](https://myanimelist.net/profile/${malUser.user_name})`,
                                        inline: true
                            }],
                                    timestamp: new Date()
                                }
                            }).catch(malSearch.sendError);
                        }).catch(function (err) {
                            message.channel.send(":x: User not found");
                        });
                } catch (err) {
                    await message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. If you want to learn more about it, feel free to join the support server");
                    return malSearch.sendError(err);
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
            guildOnly: false,
            aliases: ["mal", "anime"],
            disabled: false,
            permLevel: 1
        };

        exports.help = {
            name: 'malsearch',
            description: 'Search for anime, mangas and users on MyAnimeList',
            parameters: '`-a`(anime), `-m`(manga), `-u`(user)',
            usage: 'malsearch -a One Piece',
            category: 'utility'
        };
