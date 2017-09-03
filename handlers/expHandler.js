module.exports = async(client, message) => {
    const guildEntry = client.guildData.get(message.guild.id);
    if (client.userData.get(message.author.id) && guildEntry.generalSettings.levelSystem && guildEntry.generalSettings.levelSystem.enabled) { //Activity level system
        if (!client.talkedRecently.has(message.author.id)) {
            var expGain = Math.round(1 * message.content.length / 4);
            if (expGain > 100) { //no 500 points messages kthx
                expGain = 100;
            }
            const userEntry = client.userData.get(message.author.id);
            const getCurrentLevel = function(level, exp) {
                const exponent = 2;
                const baseXP = 100;
                const requiredXp = Math.floor(baseXP * (level ** exponent));
                if (exp >= requiredXp) {
                    return level + 1;
                } else {
                    return level;
                }
            }
            if (!userEntry.expCount) { //That stuff is for global xp
                userEntry.expCount = expGain;
                userEntry.level = getCurrentLevel(0, expGain);
            } else {
                userEntry.expCount = userEntry.expCount + expGain;
                userEntry.level = getCurrentLevel(userEntry.level, userEntry.expCount + expGain);
            }
            if (!userEntry.id) {
                userEntry.id = message.author.id;
            }
            client.userData.set(message.author.id, userEntry);
            if (guildEntry.generalSettings.levelSystem.users.filter(u => u.id === message.author.id).length === 0) {
                const curLevel = getCurrentLevel(0, expGain);
                if (curLevel !== 0) {
                    var wonRoles = "";
                    if (guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel)) {
                        if (message.guild.member(client.user).hasPermission("MANAGE_ROLES")) {
                            const roles = guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel);
                            if (roles.length !== 0) {
                                roles.forEach(function(role) {
                                    const guildRole = message.guild.roles.get(role.id);
                                    if (!guildRole) { //Automatically remove deleted roles from the list
                                        const rolePos = guildEntry.generalSettings.levelSystem.roles.findIndex(function(element) {
                                            return element.id === role.id;
                                        });
                                        guildEntry.generalSettings.levelSystem.roles.splice(rolePos, 1);
                                    } else {
                                        message.member.addRole(guildRole);
                                    }
                                });
                                wonRoles += "and won the role(s) " + guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel).map(r => `**${message.guild.roles.get(r.id).name}**`).join(", ");
                            }
                        }
                    }
                    if (message.guild.member(client.user).hasPermission("SEND_MESSAGES")) {
                        if (guildEntry.generalSettings.levelSystem.levelUpNotif) {
                            if (guildEntry.generalSettings.levelSystem.levelUpNotif === "channel") {
                                await message.channel.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + 1 + "**");
                            } else {
                                try {
                                    await message.author.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + 1 + "**")
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }
                    }
                }
                guildEntry.generalSettings.levelSystem.users.push({
                    id: message.author.id,
                    expCount: expGain,
                    level: getCurrentLevel(0, expGain)
                });
                guildEntry.generalSettings.levelSystem.totalExp = expGain;
                client.guildData.set(message.guild.id, guildEntry);
            } else {
                const userPos = guildEntry.generalSettings.levelSystem.users.findIndex(function(element) {
                    return element.id === message.author.id;
                });
                const userEntry = client.userData.get(message.author.id);
                if (userEntry.publicLevel === undefined) { //If no privacy has been set yet, make it public by default
                    userEntry.publicLevel = true;
                    client.userData.set(message.author.id, userEntry);
                }
                const curLevel = getCurrentLevel(guildEntry.generalSettings.levelSystem.users[userPos].level, guildEntry.generalSettings.levelSystem.users[userPos].expCount + expGain);
                if (curLevel !== guildEntry.generalSettings.levelSystem.users[userPos].level) {
                    guildEntry.generalSettings.levelSystem.users[userPos].level = curLevel;
                    var wonRoles = "";
                    if (guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel)) {
                        if (message.guild.member(client.user).hasPermission("MANAGE_ROLES")) {
                            const roles = guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel);
                            if (roles.length !== 0) {
                                roles.forEach(function(role) {
                                    const guildRole = message.guild.roles.get(role.id);
                                    if (!guildRole) { //Automatically remove deleted roles from the list                        
                                        const rolePos = guildEntry.generalSettings.levelSystem.roles.findIndex(function(element) {
                                            return element.id === role.id;
                                        });
                                        guildEntry.generalSettings.levelSystem.roles.splice(rolePos, 1);
                                    } else {
                                        message.member.addRole(guildRole);
                                    }
                                });
                                wonRoles += "and won the role(s) " + guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel).map(r => `**${message.guild.roles.get(r.id).name}**`).join(", ");
                            }
                        }
                    }
                    if (message.guild.member(client.user).hasPermission("SEND_MESSAGES")) {
                        if (guildEntry.generalSettings.levelSystem.levelUpNotif) {
                            if (guildEntry.generalSettings.levelSystem.levelUpNotif === "channel") {
                                await message.channel.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + curLevel + "** " + wonRoles);
                            } else {
                                try {
                                    await message.author.send(":tada: Congratulations **" + message.author.username + "**, you leveled up to level **" + curLevel + "**" + wonRoles);
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }
                    }
                }
                guildEntry.generalSettings.levelSystem.users[userPos].expCount = guildEntry.generalSettings.levelSystem.users[userPos].expCount + expGain;
                var totalExp = 0;
                guildEntry.generalSettings.levelSystem.users.forEach(function(user) {
                    totalExp = totalExp + user.expCount;
                });
                guildEntry.generalSettings.levelSystem.totalExp = totalExp;
                client.guildData.set(message.guild.id, guildEntry);
            }
        }
        // Adds the user to the set so the spam wont be counted
        client.talkedRecently.add(message.author.id);
        setTimeout(() => {
            client.talkedRecently.delete(message.author.id);
        }, 30000);
    }
}