exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            var args = message.content.split(/\s+/gim);
            args.shift();
            const guildEntry = client.guildData.get(message.guild.id);
            let leaderboard = guildEntry.generalSettings.levelSystem.users.filter(m => message.guild.members.has(m.id)).sort(function(a, b) {
                return b.expCount - a.expCount;
            });
            let loveLeaderboard = client.userData.filterArray(u => message.guild.members.has(JSON.parse(u).id)).sort(function(a, b) {
                return JSON.parse(b).generalSettings.lovePoints - JSON.parse(a).generalSettings.lovePoints;
            });
            let pointsLeaderboard = client.userData.filterArray(u => message.guild.members.has(JSON.parse(u).id) && !message.guild.members.get(JSON.parse(u).id).bot).sort(function(a, b) {
                return JSON.parse(b).generalSettings.points - JSON.parse(a).generalSettings.points;
            });
            let glbLeaderboard = client.userData.filterArray(u => JSON.parse(u).dataPrivacy.publicLevel && client.users.has(JSON.parse(u).id)).sort(function(a, b) {
                return JSON.parse(b).experience.expCount - JSON.parse(a).experience.expCount;
            });
            let glbLoveLeaderboard = client.userData.filterArray(u => JSON.parse(u).dataPrivacy.publicLove && client.users.has(JSON.parse(u).id)).sort(function(a, b) {
                return JSON.parse(b).generalSettings.lovePoints - JSON.parse(a).generalSettings.lovePoints;
            });
            let glbPointsLeaderboard = client.userData.filterArray(u => JSON.parse(u).dataPrivacy.publicPoints && client.users.has(JSON.parse(u).id)).sort(function(a, b) {
                return JSON.parse(b).generalSettings.points - JSON.parse(a).generalSettings.points;
            });
            const position = function(id, target) {
                let userPosition = target.findIndex(function(element) {
                    return element.id === id;
                });
                if (target !== leaderboard) {
                    userPosition = target.findIndex(function(element) {
                        return JSON.parse(element).id === id;
                    });
                }
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
            let localExpLeaderboard = {
                embed: {
                    title: `${message.guild.name}'s experience leaderboard`,
                    color: 3447003,
                    description: leaderboard.slice(0, 10).map(u => `#${position(u.id, leaderboard)} - **${message.guild.members.get(u.id).user.tag}**\nLevel: ${u.level} | Exp: ${Math.round(u.expCount)}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${leaderboard.findIndex(function (element) {return element.id === message.author.id}) + 1}/${leaderboard.length}`
                    },
                    thumbnail: {
                        url: message.guild.iconURL
                    }
                }
            }
            let localLoveLeaderboard = {
                embed: {
                    title: `${message.guild.name}'s love leaderboard`,
                    color: 3447003,
                    description: loveLeaderboard.slice(0, 10).map(u => `#${position(JSON.parse(u).id, loveLeaderboard)} - **${message.guild.members.get(JSON.parse(u).id).user.tag}**\nLove points: ${JSON.parse(u).generalSettings.lovePoints}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${loveLeaderboard.findIndex(function (element) {return JSON.parse(element).id === message.author.id}) + 1}/${loveLeaderboard.length}`
                    },
                    thumbnail: {
                        url: message.guild.iconURL
                    }
                }
            }
            let localPointsLeaderboard = {
                embed: {
                    title: `${message.guild.name}'s points leaderboard`,
                    color: 3447003,
                    description: pointsLeaderboard.slice(0, 10).map(u => `#${position(JSON.parse(u).id, pointsLeaderboard)} - **${message.guild.members.get(JSON.parse(u).id).user.tag}**\nPoints: ${JSON.parse(u).generalSettings.points}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${pointsLeaderboard.findIndex(function (element) {return JSON.parse(element).id === message.author.id}) + 1}/${pointsLeaderboard.length}`
                    },
                    thumbnail: {
                        url: message.guild.iconURL
                    }
                }
            }
            let globalExpLeaderboard = {
                embed: {
                    title: `Global experience leaderboard`,
                    color: 3447003,
                    description: glbLeaderboard.slice(0, 10).map(u => `#${position(JSON.parse(u).id, glbLeaderboard)} - **${client.users.get(JSON.parse(u).id).tag}**\nLevel: ${JSON.parse(u).experience.level} | Exp: ${Math.round(JSON.parse(u).experience.expCount)}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${glbLeaderboard.findIndex(function (element) {return JSON.parse(element).id === message.author.id}) + 1}/${glbLeaderboard.length}`
                    },
                    thumbnail: {
                        url: client.user.avatarURL
                    }
                }
            }
            let globalLoveLeaderboard = {
                embed: {
                    title: `Global love leaderboard`,
                    color: 3447003,
                    description: glbLoveLeaderboard.slice(0, 10).map(u => `#${position(JSON.parse(u).id, glbLoveLeaderboard)} - **${client.users.get(JSON.parse(u).id).tag}**\nLove points: ${JSON.parse(u).generalSettings.lovePoints}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${glbLoveLeaderboard.findIndex(function (element) {return JSON.parse(element).id === message.author.id}) + 1}/${glbLoveLeaderboard.length}`
                    },
                    thumbnail: {
                        url: client.user.avatarURL
                    }
                }
            }
            let globalPointsLeaderboard = {
                embed: {
                    title: `Global points leaderboard`,
                    color: 3447003,
                    description: glbPointsLeaderboard.slice(0, 10).map(u => `#${position(JSON.parse(u).id, glbPointsLeaderboard)} - **${client.users.get(JSON.parse(u).id).tag}**\nPoints: ${JSON.parse(u).generalSettings.points}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${glbPointsLeaderboard.findIndex(function (element) {return JSON.parse(element).id === message.author.id}) + 1}/${glbPointsLeaderboard.length}`
                    },
                    thumbnail: {
                        url: client.user.avatarURL
                    }
                }
            }
            const interactiveMessage = await message.channel.send(globalExpLeaderboard);
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            let pageReactions = ["⭐", "❤", "🎀", "🌐", "❌"];
            if (localExpLeaderboard.length > 0 && guildEntry.generalSettings.levelSystem.enabled) pageReactions.unshift();
            for (let i = 0; i < pageReactions.length; i++) {
                await interactiveMessage.react(pageReactions[i]);
            }
            var timeout = setTimeout(async function() {
                collector.stop("timeout");
            }, 120000);
            let page = 'exp';
            let global = true;
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //reset the timeout
                if (r.emoji.name === "⭐") { //Get exp leaderboard
                    if (page !== 'exp') { //Dont edit for nothing
                        if (!global) {
                            if (leaderboard.length < 1 || !guildEntry.generalSettings.levelSystem.enabled) {
                                await interactiveMessage.edit({
                                    embed: {
                                        description: ':x: There is nobody in the leaderboard yet or the experience system is disabled on this server'
                                    }
                                });
                            } else await interactiveMessage.edit(localExpLeaderboard);
                        } else {
                            await interactiveMessage.edit(globalExpLeaderboard);
                        }
                        page = 'exp';
                    }
                } else if (r.emoji.name === "❤") { //Get love leaderboard
                    if (page !== 'love') { //Dont edit for nothing
                        if (!global) {
                            await interactiveMessage.edit(localLoveLeaderboard);
                        } else {
                            await interactiveMessage.edit(globalLoveLeaderboard);
                        }
                        page = 'love';
                    }
                } else if (r.emoji.name === "🎀") { //Get points leaderboard
                    if (page !== 'points') { //Dont edit for nothing
                        if (!global) {
                            await interactiveMessage.edit(localPointsLeaderboard);
                        } else {
                            await interactiveMessage.edit(globalPointsLeaderboard);
                        }
                        page = 'points';
                    }
                } else if (r.emoji.name === "🌐") { //Change global
                    if (global) {
                        global = false;
                        if (page === 'exp' && guildEntry.generalSettings.levelSystem.enabled) await interactiveMessage.edit(localExpLeaderboard);
                        else await interactiveMessage.edit({
                            embed: {
                                description: ':x: There is nobody in the leaderboard yet or the experience system is disabled on this server'
                            }
                        });
                        if (page === 'love') await interactiveMessage.edit(localLoveLeaderboard);
                        else if (page === 'points') await interactiveMessage.edit(localPointsLeaderboard);
                    } else {
                        global = true;
                        if (page === 'exp') await interactiveMessage.edit(globalExpLeaderboard);
                        else if (page === 'love') await interactiveMessage.edit(globalLoveLeaderboard);
                        else if (page === 'points') await interactiveMessage.edit(globalPointsLeaderboard);
                    }
                } else if (r.emoji.name === "❌") { //Abort the command
                    clearTimeout(timeout); //Dont let the timeout continue any further, after all the command ended
                    collector.stop("aborted"); //End the collector
                }
                await r.remove(message.author.id); //Delete user reaction
                timeout = setTimeout(async function() {
                    collector.stop("timeout");
                }, 120000); //Restart the timeout
            });
            collector.on('end', async(collected, reason) => { //On collector end
                return resolve(await interactiveMessage.delete());
            });
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: ["lb"],
    disabled: false
};

exports.help = {
    name: 'leaderboard',
    description: 'Get the experience leaderboard of this server or all the servers',
    usage: 'leaderboard',
    category: 'misc',
};