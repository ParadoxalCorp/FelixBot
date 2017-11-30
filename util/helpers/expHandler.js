module.exports = async(client, message) => {
    const guildEntry = client.guildData.get(message.guild.id);
    const userInDatabase = client.userData.get(message.author.id);
    //Activity level system
    if (guildEntry.generalSettings.levelSystem.enabled) {
        if (!client.talkedRecently.has(message.author.id)) {

            let expGain = message.attachments[0] ? Math.round((Number(message.attachments.map(f => f.filesize).join((`+`)))) / 10000) : Math.round(1 * message.content.length / 4);
            if (expGain > 75) expGain = 75; //no 500 points messages kthx
            const userEntry = client.userData.get(message.author.id) || client.defaultUserData(message.author.id);
            const getCurrentLevel = function(level, exp) { //--------Get level function-----------------
                const exponent = 2;
                const baseXP = 100;
                const requiredXp = Math.floor(baseXP * (level ** exponent));
                if (exp >= requiredXp) return level + 1;
                else return level;
            }
            userEntry.experience.expCount = userEntry.experience.expCount + expGain;
            userEntry.experience.level = getCurrentLevel(userEntry.experience.level, userEntry.experience.expCount + expGain);
            if (userInDatabase) client.userData.set(message.author.id, userEntry);
            if (!guildEntry.generalSettings.levelSystem.users.find(u => u.id === message.author.id)) {
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
            guildEntry.generalSettings.levelSystem.users[userPos].messages++;
            const curLevel = getCurrentLevel(guildEntry.generalSettings.levelSystem.users[userPos].level, guildEntry.generalSettings.levelSystem.users[userPos].expCount + expGain);
            const roles = guildEntry.generalSettings.levelSystem.roles.filter(r => (r.method === "experience" && r.at === curLevel) || (r.method === "message" && guildEntry.generalSettings.levelSystem.users[userPos].messages === r.at)).filter(r => message.guild.roles.has(r.id) && !message.guild.members.get(message.author.id).roles.find(r => r === r.id));
            if (curLevel > guildEntry.generalSettings.levelSystem.users[userPos].level || guildEntry.generalSettings.levelSystem.roles.find(r => r.at === guildEntry.generalSettings.levelSystem.users[userPos].messages)) {
                guildEntry.generalSettings.levelSystem.users[userPos].level = curLevel;
                let wonRoles = "";
                if (roles.length && message.guild.members.get(client.user.id).hasPermission("manageRoles")) {
                    try {
                        roles.forEach(role => { message.member.addRole(role.id) }, `Reached the required experience level/messages count`);
                    } catch (err) {}
                    wonRoles += "and won the role(s) " + roles.map(r => `\`${message.guild.roles.get(r.id).name}\``).join(", ");
                }
                if (message.guild.members.get(client.user.id).hasPermission("sendMessages") && guildEntry.generalSettings.levelSystem.levelUpNotif) {
                    try {
                        if (guildEntry.generalSettings.levelSystem.levelUpNotif === "channel") await message.channel.createMessage(`:tada: Congratulations **${message.author.username}**, you leveled up to level **${guildEntry.generalSettings.levelSystem.users[userPos].level}** ${wonRoles}`);
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