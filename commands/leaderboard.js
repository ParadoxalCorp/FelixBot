exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            var args = message.content.split(/\s+/gim);
            args.shift();
            const guildEntry = client.guildData.get(message.guild.id);
            let leaderboard = guildEntry.generalSettings.levelSystem.users.filter(m => message.guild.members.has(m.id)).sort((a, b) => b.expCount - a.expCount);
            let loveLeaderboard = client.userData.filterArray(u => message.guild.members.has(u.id)).sort((a, b) => b.generalSettings.lovePoints - a.generalSettings.lovePoints);
            let pointsLeaderboard = client.userData.filterArray(u => message.guild.members.has(u.id) && !message.guild.members.get(u.id).bot).sort((a, b) => b.experience.points - a.experience.points)
            let glbLeaderboard = client.userData.filterArray(u => u.dataPrivacy.publicLevel && client.users.has(u.id)).sort((a, b) => b.experience.expCount - a.experience.expCount);
            let glbLoveLeaderboard = client.userData.filterArray(u => u.dataPrivacy.publicLove && client.users.has(u.id)).sort((a, b) => b.generalSettings.lovePoints - a.generalSettings.lovePoints);
            let glbPointsLeaderboard = client.userData.filterArray(u => u.dataPrivacy.publicPoints && client.users.has(u.id)).sort((a, b) => b.generalSettings.points - a.generalSettings.points);
            const position = function(id, target) {
                let userPosition = target.findIndex(e => e.id === id);
                if (userPosition === 0) return ":trophy:";                   
                else if (userPosition === 1) return ":second_place:";                   
                else if (userPosition === 2)  return ":third_place:"
                else return userPosition + 1;
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
                    description: loveLeaderboard.slice(0, 10).map(u => `#${position(u.id, loveLeaderboard)} - **${message.guild.members.get(u.id).user.tag}**\nLove points: ${u.generalSettings.lovePoints}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${loveLeaderboard.findIndex(element => element.id === message.author.id) + 1}/${loveLeaderboard.length}`
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
                    description: pointsLeaderboard.slice(0, 10).map(u => `#${position(u.id, pointsLeaderboard)} - **${message.guild.members.get(u.id).user.tag}**\nPoints: ${u.generalSettings.points}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${pointsLeaderboard.findIndex(function (element) {return element.id === message.author.id}) + 1}/${pointsLeaderboard.length}`
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
                    description: glbLeaderboard.slice(0, 10).map(u => `#${position(u.id, glbLeaderboard)} - **${client.users.get(u.id).tag}**\nLevel: ${u.experience.level} | Exp: ${Math.round(u.experience.expCount)}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${glbLeaderboard.findIndex(function (element) {return element.id === message.author.id}) + 1}/${glbLeaderboard.length}`
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
                    description: glbLoveLeaderboard.slice(0, 10).map(u => `#${position(u.id, glbLoveLeaderboard)} - **${client.users.get(u.id).tag}**\nLove points: ${u.generalSettings.lovePoints}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${glbLoveLeaderboard.findIndex(function (element) {return element.id === message.author.id}) + 1}/${glbLoveLeaderboard.length}`
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
                    description: glbPointsLeaderboard.slice(0, 10).map(u => `#${position(u.id, glbPointsLeaderboard)} - **${client.users.get(u.id).tag}**\nPoints: ${u.generalSettings.points}`).join("\n\n"),
                    footer: {
                        text: `Your position: #${glbPointsLeaderboard.findIndex(function (element) {return element.id === message.author.id}) + 1}/${glbPointsLeaderboard.length}`
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