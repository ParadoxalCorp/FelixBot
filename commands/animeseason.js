exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const getSeason = function() {
                    let month = new Date().getMonth();
                    let season = '';
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
                //Rewrite
            let currentPeriod = await client.getSeason(new Date().getFullYear(), getSeason());
            let currentConfig = {
                genres: false,
                type: "TV",
                year: new Date().getFullYear(),
                season: getSeason()
            };
            let newConfig = {
                genres: false,
                type: "TV",
                year: new Date().getFullYear(),
                season: getSeason()
            };
            //Generic message so we dont have to put it everywhere
            let page = 0;
            let paginatedResults = await client.pageResults({
                results: currentPeriod.info.TV
            });
            const mainObject = function(results) {
                let type = results.info.TV;
                if (currentConfig.type === "Movies") type = results.info.Movies;
                else if (currentConfig.type === "OVAs") type = results.info.OVAs;
                return {
                    embed: {
                        description: `Here are the aired animes for the specified time, use the reactions to change the search parameters and :mag: to launch a new search\n**:fallen_leaf: Season**: ${newConfig.season} | Current: ${currentConfig.season}\n**:calendar: Year**: ${newConfig.year} | Current: ${currentConfig.year}\n**:projector: Type**: ${newConfig.type} | Current: ${currentConfig.type}\n\`\`\`\n${paginatedResults.results[page][0].map(a => a.title).join("\n").substr(0, 1800)}\`\`\``,
                        footer: {
                            text: `Showing page ${page + 1}/${paginatedResults.length} | Time limit: 120 seconds`
                        }
                    }
                }
            };
            //Post current period message and create collector
            const interactiveMessage = await message.channel.send(mainObject(currentPeriod));
            const collector = await interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            //Add the reactions
            let reactions = ['🍂', '📆', '📽', '🔍', '◀', '▶', '❌'];
            for (let i = 0; i < reactions.length; i++) await interactiveMessage.react(reactions[i]);
            //Launch timeout countdown
            let timeout = setTimeout(function() {
                collector.stop('timeout');
            }, 120000);
            //----------------------------------On collector collect------------------------------
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //Reset timeout
                if (r.emoji.name === '🍂') { //Change season
                    if (newConfig.season === 'spring') newConfig.season = 'summer';
                    else if (newConfig.season === 'summer') newConfig.season = 'fall';
                    else if (newConfig.season === 'fall') newConfig.season = 'winter';
                    else if (newConfig.season === 'winter') newConfig.season = 'spring';
                    await interactiveMessage.edit(mainObject(currentPeriod));
                } else if (r.emoji.name === '📆') { //Change year
                    const maxYear = 1901 + (new Date()).getYear()
                    let writeYearNotice = await message.channel.send({
                        embed: {
                            description: `You can now write the year, please note that the year must be between 2000 and ${maxYear}`
                        }
                    });
                    try {
                        const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                            max: 1,
                            time: 120000,
                            errors: ["time"]
                        });
                        if (!(collected.first().content.trim() <= maxYear) || !(collected.first().content.trim() >= 2000)) {
                            let invalidYear = await message.channel.send({
                                embed: {
                                    description: `:x: The year must be between 2000 and ${maxYear}`
                                }
                            });
                            invalidYear.delete(5000);
                        } else {
                            newConfig.year = Math.round(Number(collected.first().content.trim()));
                        }
                        if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) collected.first().delete();
                    } catch (e) {
                        collector.stop('timeout');
                    } finally {
                        writeYearNotice.delete();
                    }
                    await interactiveMessage.edit(mainObject(currentPeriod));
                } else if (r.emoji.name === '📽') { //Change type
                    if (currentConfig.type === 'TV') {
                        currentConfig.type = 'Movies';
                        newConfig.type = "Movies";
                        paginatedResults = await client.pageResults({
                            results: currentPeriod.info.Movies
                        });
                    } else if (currentConfig.type === 'Movies') {
                        currentConfig.type = 'OVAs';
                        newConfig.type = "OVAs";
                        paginatedResults = await client.pageResults({
                            results: currentPeriod.info.OVAs
                        });
                    } else if (currentConfig.type === 'OVAs') {
                        currentConfig.type = 'TV';
                        newConfig.type = "TV"
                        paginatedResults = await client.pageResults({
                            results: currentPeriod.info.TV
                        });
                    }
                    page = 0;
                    await interactiveMessage.edit(mainObject(currentPeriod));
                } else if (r.emoji.name === "🔍") { //Launch search
                    page = 0;
                    currentPeriod = await client.getSeason(newConfig.year, newConfig.season);
                    currentConfig = newConfig;
                    await interactiveMessage.edit(mainObject(currentPeriod));
                } else if (r.emoji.name === "◀") { //Move to previous page
                    if (page === 0) page = paginatedResults.length - 1;
                    else page--;
                    await interactiveMessage.edit(mainObject(currentPeriod));
                } else if (r.emoji.name === "▶") { //Move to next page
                    if (page === paginatedResults.length - 1) page = 0;
                    else page++;
                    await interactiveMessage.edit(mainObject(currentPeriod));
                } else if (r.emoji.name === "❌") {
                    collector.stop('aborted');
                }
                await r.remove(message.author.id); //Delete user reaction         
                timeout = setTimeout(function() {
                    collector.stop('timeout');
                }, 120000);
            });
            //--------------------------On collector end-----------------------------------------------
            collector.on('end', async(collected, reason) => {
                interactiveMessage.delete();
            });
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: ["as"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'animeseason',
    description: 'Get the animes for the specified season',
    usage: 'animeseason',
    category: 'utility',
};