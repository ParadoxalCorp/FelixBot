exports.run = async(client, message) => {
    try {
        var getSeason = function () {
            var month = new Date().getMonth();
            var season = '';
            switch (month) {
                case 12:
                case 1:
                case 2:
                    season = 'winter';
                    break;
                case 3:
                case 4:
                case 5:
                    season = 'spring';
                    break;
                case 6:
                case 7:
                case 8:
                    season = 'summer';
                    break;
                case 9:
                case 10:
                case 11:
                    season = 'fall';
                    break;
            }
            return season;
        }
        const parameters = client.searchForParameter(message, null, [{
            aliases: ["-genre", "-g"],
            name: "genres"
        }, {
            aliases: ["-type", "-t"],
            name: "type"
        }, {
            aliases: ["-year", "-y"],
            name: "year"
        }, {
            aliases: ["-season", "-s"],
            name: "season"
        }]);
        var options = {
            genres: false,
            type: "TV",
            year: new Date().getFullYear(),
            season: getSeason()
        }
        if (parameters.length > 0) {
            parameters.forEach(function (param) {
                if (param.name === "genres") {
                    options.genres = param.argument.toLowerCase();
                } else if (param.name === "type") {
                    options.type = param.argument;
                } else if (param.name === "year") {
                    options.year = param.argument;
                } else if (param.name === "season") {
                    options.season = param.argument.toLowerCase();
                }
            })
        }
        try {
            await client.getSeason(options.year, options.season).then(async(result) => {
                try {
                    var type;
                    const allowedTypes = ["tv", "movies", "ovas"];
                    if (allowedTypes.indexOf(options.type.toLowerCase()) === -1) {
                        return await message.channel.send(":x: The type you entered is not valid, please use one of the following: `tv`, `movies` or `ovas` (Note: The default type is `tv`)");
                    }
                    if (options.type.toLowerCase() === "tv") {
                        type = result.info.TV;
                    } else if (options.type.toLowerCase() === "movies") {
                        type = result.info.Movies;
                    } else if (options.type.toLowerCase() === "ovas") {
                        type = result.info.OVAs;
                    }
                    if (options.genres) {
                        var genres;
                        var i = 1;
                        if (type.filter(a => a.genres.map(g => g.toLowerCase()).indexOf(options.genres) !== -1).length === 0) {
                            return await message.channel.send(":x: Your search did not returned any result, the genre you used may be invalid or there may be simply no results");
                        } else {
                            genres = type.filter(a => a.genres.map(g => g.toLowerCase()).indexOf(options.genres) !== -1).map(a => `[${i++}] ${a.title}`).join("\n");
                            if (genres.length > 1950) {
                                genres = genres.substr(0, 1950) + "...";
                            }
                        }
                        client.awaitReply(message, "Here's the list of the **" + options.year + " " + options.season + "** (type: " + options.type + ") season animes corresponding to your search. This command will end in 60 seconds", "```\n" + genres + "```", 60000).then(async(reply) => {
                            if (!reply) {
                                return;
                            }
                            if ((typeof Number(reply.reply.content) !== "number") || (reply.reply.content - 1 >= type.length) || (reply.reply.content - 1 < 0)) {
                                return;
                            }
                            const anime = type.filter(a => a.genres.map(g => g.toLowerCase()).indexOf(options.genres) !== -1)[reply.reply.content - 1];
                            if (anime === undefined) {
                                return;
                            }
                            var synopsis = anime.synopsis;
                            if (synopsis.length > 1024) {
                                synopsis = synopsis.substr(0, 1021) + "...";
                            }
                            if (message.guild) {
                                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                    await reply.reply.delete();
                                }
                            }
                            return await reply.question.edit({
                                embed: {
                                    title: anime.title,
                                    image: {
                                        url: anime.picture
                                    },
                                    fields: [{
                                        name: ":1234: Episodes",
                                        value: anime.nbEp,
                                        inline: true
                            }, {
                                        name: ":open_file_folder: Genres",
                                        value: anime.genres.join(", "),
                                        inline: true
                            }, {
                                        name: ":film_frames: Producers",
                                        value: anime.producers.join(", "),
                                        inline: true
                            }, {
                                        name: ":calendar: Release Date",
                                        value: anime.releaseDate,
                                        inline: true
                            }, {
                                        name: ":notepad_spiral: Synopsis",
                                        value: synopsis,
                            }]
                                }
                            })
                        });
                    } else {
                        var overall;
                        var i = 1;
                        if (type.map(a => a.title).length > 1950) {
                            overall = type.map(a => `[${i++}] ${a.title}`).join("\n").substr(0, 1950) + "...";
                        } else {
                            overall = type.map(a => `[${i++}] ${a.title}`).join("\n");
                        }
                        client.awaitReply(message, ":mag: Here's the list of the **" + options.year + " " + options.season + "** (type: " + options.type + ") season animes corresponding to your search. You can select one by typing its number. This command will end in 60 seconds", "```\n" + overall + "```", 60000).then(async(reply) => {
                            if (!reply) {
                                return;
                            }
                            if ((typeof Number(reply.reply.content) !== "number") || (reply.reply.content - 1 >= type.length) || (reply.reply.content - 1 < 0)) {
                                return;
                            }
                            const anime = type[reply.reply.content - 1];
                            if (anime === undefined) {
                                return;
                            }
                            var synopsis = anime.synopsis;
                            if (synopsis.length > 1024) {
                                synopsis = synopsis.substr(0, 1021) + "...";
                            }
                            if (message.guild) {
                                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                    await reply.reply.delete();
                                }
                            }
                            return await reply.question.edit({
                                embed: {
                                    title: anime.title,
                                    image: {
                                        url: anime.picture
                                    },
                                    fields: [{
                                        name: ":1234: Episodes",
                                        value: anime.nbEp,
                                        inline: true
                            }, {
                                        name: ":open_file_folder: Genres",
                                        value: anime.genres.join(", "),
                                        inline: true
                            }, {
                                        name: ":film_frames: Producers",
                                        value: anime.producers.join(", "),
                                        inline: true
                            }, {
                                        name: ":calendar: Release Date",
                                        value: anime.releaseDate,
                                        inline: true
                            }, {
                                        name: ":notepad_spiral: Synopsis",
                                        value: synopsis,
                            }]
                                }
                            })
                        })
                    }
                } catch (err) {
                    console.error(err);
                    return await message.channel.send(":x: An error occured, make sure you used a valid genre, year, season or type");
                }
            });
        } catch (err) {
            console.error(err);
            return await message.channel.send(":x: An error occured");
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
    guildOnly: false,
    aliases: ["as"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'animeseason',
    parameters: "`-year`, `-season`, `-genre`, `-type`",
    description: 'Get the animes for the specified season',
    usage: 'animeseason -season winter',
    category: 'generic',
    detailledUsage: "All parameters are optional and they all can be combined, a few examples: \n`{prefix}animeseason` Will return a list of this season planned anime with the type tv\n`{prefix}animeseason -year 2016 -season winter -genre Drama -type Movies` Will return a list of drama animes movies aired during winter 2016\n-**Types:** `tv`, `movies` `ovas`\n-**Genres:** A list of all usable genres here: <https://www.livechart.me/preferences>"
};
