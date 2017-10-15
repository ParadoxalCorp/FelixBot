module.exports = async(client, message) => {
    const guildEntry = client.guildData.get(message.guild.id);
    if (client.userData.get(message.author.id) && guildEntry.generalSettings.levelSystem.enabled) { //Activity level system
        if (!client.talkedRecently.has(message.author.id)) {
            let expGain = message.attachments.first() ? Math.round((Number(message.attachments.map(f => f.filesize).join((`+`)))) / 10000) : Math.round(1 * message.content.length / 4);
            if (expGain > 75) expGain = 75; //no 500 points messages kthx
            const userEntry = client.userData.get(message.author.id);
            const getCurrentLevel = function(level, exp) { //--------Get level function-----------------
                const exponent = 2;
                const baseXP = 100;
                const requiredXp = Math.floor(baseXP * (level ** exponent));
                if (exp >= requiredXp) return level + 1;
                else return level;
            }
            userEntry.experience.expCount = userEntry.experience.expCount + expGain;
            userEntry.experience.level = getCurrentLevel(userEntry.experience.level, userEntry.experience.expCount + expGain);
            client.userData.set(message.author.id, userEntry);
            if (guildEntry.generalSettings.levelSystem.users.filter(u => u.id == message.author.id).length < 1) {
                guildEntry.generalSettings.levelSystem.users.push({
                    id: message.author.id,
                    expCount: 0,
                    level: 0,
                    messages: 0,
                    joinedVc: 0,
                    leftVc: 0,
                    totalVcTime: 0
                });
                client.guildData.set(message.guild.id, guildEntry);
            }
            const userPos = guildEntry.generalSettings.levelSystem.users.findIndex(u => u.id === message.author.id);
            const curLevel = getCurrentLevel(guildEntry.generalSettings.levelSystem.users[userPos].level, guildEntry.generalSettings.levelSystem.users[userPos].expCount + expGain);
            if (curLevel > guildEntry.generalSettings.levelSystem.users[userPos].level) {
                guildEntry.generalSettings.levelSystem.users[userPos].level = curLevel;
                client.guildData.set(message.guild.id, guildEntry);
                let wonRoles = "";
                if (guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel) && message.guild.member(client.user).hasPermission("MANAGE_ROLES")) {
                    const roles = guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel).filter(r => message.guild.roles.has(r.id) && !message.guild.member(message.author).roles.has(r.id)); // filter deleted roles and roles the user have from the list
                    if (roles.length !== 0) {
                        let roleIds = [];
                        roles.forEach(role => { roleIds.push(role.id); });
                        message.member.addRoles(roleIds);
                        wonRoles += "and won the role(s) " + guildEntry.generalSettings.levelSystem.roles.filter(r => r.atLevel === curLevel).map(r => `\`${message.guild.roles.get(r.id).name}\``).join(", ");
                    }
                }
                if (message.guild.member(client.user).hasPermission("SEND_MESSAGES") && guildEntry.generalSettings.levelSystem.levelUpNotif) {
                    try {
                        if (guildEntry.generalSettings.levelSystem.levelUpNotif === "channel") await message.channel.send(`:tada: Congratulations **${message.author.username}**, you leveled up to level **${guildEntry.generalSettings.levelSystem.users[userPos].level}** ${wonRoles}`);
                        else await message.author.send(`:tada: Congratulations **${message.author.username}**, you leveled up to level **${guildEntry.generalSettings.levelSystem.users[userPos].level}** ${wonRoles}`);
                    } catch (err) {
                        console.error('An error occurred while trying to notif a user for their level up', err);
                    }
                }
            }
            guildEntry.generalSettings.levelSystem.users[userPos].expCount = guildEntry.generalSettings.levelSystem.users[userPos].expCount + expGain;
            client.guildData.set(message.guild.id, guildEntry);
        }
    }
    // Adds the user to the set so the spam wont be counted
    client.talkedRecently.add(message.author.id);
    setTimeout(() => {
        client.talkedRecently.delete(message.author.id);
    }, 30000);
}