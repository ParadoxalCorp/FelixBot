const unirest = require('unirest');
const popura = require('popura');
const malScraper = require('mal-scraper');

exports.run = async(client, message) => {
    const config = client.database.Data.global[0];
    const malClient = popura(config.malCredentials.name, config.malCredentials.password);

    try {
        const whitespace = message.content.indexOf(" ");
        if (whitespace === -1) {
            return await message.channel.send(":x: You did not specified any manga to search for");
        }
        var mangaName = message.content.substr(whitespace + 1).trim();
        if (mangaName === "") {
            return await message.channel.send(":x: You did not enter any manga to search, correct syntax => `" + client.prefix + client.commands.get(this.help.name).help.name + " Manga Name`");
        }
        const userMessage = message;

        async function getManga(selectedAnime) {
            try {
                var title, //Stuff that will get edited by conditions to avoid as much as possible embed errors
                    chapters,
                    volumes,
                    score,
                    type,
                    status,
                    startDate,
                    endDate,
                    synopsis;
                if (selectedAnime.title) {
                    title = selectedAnime.title;
                } else {
                    title = "None";
                }
                if (selectedAnime.chapters !== undefined) {
                    if (selectedAnime.episodes === 0) {
                        chapters = "Unknown";
                    } else {
                        chapters = selectedAnime.chapters.toString();
                    }
                } else {
                    chapters = "None";
                }
                if (selectedAnime.volumes !== undefined) {
                    if (selectedAnime.volumes === 0) {
                        volumes = "Unknown";
                    } else {
                        volumes = selectedAnime.volumes.toString();
                    }
                } else {
                    volumes = "None";
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
                        var extractFirstPart = selectedAnime.synopsis.substr(0, 1021);
                        var cleanSynopsis = extractFirstPart.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, "");
                        synopsis = cleanSynopsis + ".."
                    } else {
                        var cleanSynopsis = selectedAnime.synopsis.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, "");
                        synopsis = cleanSynopsis;
                    }
                } else {
                    synopsis = "None";
                }
                return await message.channel.send({
                    embed: {
                        title: title,
                        image: {
                            url: selectedAnime.image
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
            } catch (err) {
                await message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. If you want to learn more about it, feel free to join the support server");
                return console.error(err);
            }
        }
        await message.channel.send("Searching for " + mangaName + "...").then(async(message) => {
            await malClient.searchMangas(mangaName)
                .then(async function (res) {
                    if (!res[0]) {
                        return await message.edit(":x: Your search did not returned any result");
                    }
                    if (res.length > 1) {
                        let i = 1;
                        var resultList = res.map(m => `[${i++}] ${m.title}`).join("\n");
                        //resultList = resultList.replace(/undefined/gim, ''); 
                        if (resultList.length > 2045) {
                            resultList = resultList.substr(0, 2042) + "...";
                        }
                        client.awaitReply(userMessage, ":mag: Your search has returned more than one result, select one by typing a number", "```\n" + resultList + "```").then(async(reply) => {
                            if (!reply) {
                                return await message.channel.send(":x: Timeout: Command aborted");
                            }
                            if (message.guild) {
                                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                    await reply.reply.delete();
                                }
                            }
                            await reply.question.delete();
                            if ((typeof Number(reply.reply.content) !== "number") || (reply.reply.content - 1 >= res.length) || (reply.reply.content - 1 < 0)) {
                                return await message.channel.send(":x: You did not enter a whole number or the number you specified is not valid");
                            }
                            getManga(res[Number(reply.reply.content) - 1]);
                        });
                    } else {
                        getManga(res[0]);
                    }
                }).catch(err => console.error(err));
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
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
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
    name: 'manga',
    description: 'Search the specified manga through MyAnimeList',
    usage: 'manga Dragon Ball',
    category: 'utility',
};
