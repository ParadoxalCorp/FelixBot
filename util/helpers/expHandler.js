module.exports = async(client, message) => {
    const guildEntry = client.guildData.get(message.guild.id);
    //Activity level system
    if (guildEntry.generalSettings.levelSystem.enabled && !client.talkedRecently.has(message.author.id)) {
        const userInDatabase = client.userData.get(message.author.id);
        //Calculate the gain
        let expGain = message.attachments[0] ? Math.round((Number(message.attachments.map(f => f.filesize).join((`+`)))) / 10000) : Math.round(1 * message.content.length / 4);
        if (expGain > 75) expGain = 75; //no 500 points messages kthx
        //Get the user database entry or "simulate" one that wont get saved
        const userEntry = userInDatabase || client.defaultUserData(message.author.id);
        //Function to determinate the level
        const getCurrentLevel = function(level, exp) {
            const exponent = 2;
            const baseXP = 100;
            const requiredXp = Math.floor(baseXP * (level ** exponent));
            if (exp >= requiredXp) return level + 1;
            else return level;
        };
        //Set the new experience count and level of the user
        userEntry.experience.expCount = userEntry.experience.expCount + expGain;
        userEntry.experience.level = getCurrentLevel(userEntry.experience.level, userEntry.experience.expCount + expGain);
        if (userInDatabase) client.userData.set(message.author.id, userEntry);
        //Update or set the guild local experience 
        if (!guildEntry.generalSettings.levelSystem.users.find(u => u.id === message.author.id)) {
            guildEntry.generalSettings.levelSystem.users.push({
                id: message.author.id,
                expCount: 0,
                level: 0,
                messages: 0,
                joinedVc: 0,
                leftVc: 0,
                totalVcTime: 0,
                givenRoles: []
            });
        }
        const userPos = guildEntry.generalSettings.levelSystem.users.findIndex(u => u.id === message.author.id);
        guildEntry.generalSettings.levelSystem.users[userPos].messages++;
        const curLevel = getCurrentLevel(guildEntry.generalSettings.levelSystem.users[userPos].level, guildEntry.generalSettings.levelSystem.users[userPos].expCount + expGain);
        const roles = guildEntry.generalSettings.levelSystem.roles.filter(r => (r.method === "experience" && r.at === curLevel) || (r.method === "message" && guildEntry.generalSettings.levelSystem.users[userPos].messages === r.at)).filter(r => message.guild.roles.has(r.id) && !message.guild.members.get(message.author.id).roles.find(r => r === r.id));
        //If a requirement is met, add the roles and send a notification
        if (curLevel > guildEntry.generalSettings.levelSystem.users[userPos].level || guildEntry.generalSettings.levelSystem.roles.find(r => r.at === guildEntry.generalSettings.levelSystem.users[userPos].messages)) {
            let wonRoles = "";
            if (roles.length && message.guild.members.get(client.user.id).hasPermission("manageRoles")) {
                if (guildEntry.generalSettings.levelSystem.autoRemove) {
                    let oldRoles = message.member.roles.filter(r => guildEntry.generalSettings.levelSystem.roles.find(role => role.id === r) &&
                        guildEntry.generalSettings.levelSystem.users[userPos].givenRoles && guildEntry.generalSettings.levelSystem.users[userPos].givenRoles.find(role => role === r));
                    oldRoles.forEach(role => {
                        try {
                            message.member.removeRole(role, `Reached a higher experience level/messages count requirement and auto-removal is enabled`);
                        } catch (err) {}
                    });
                }
                roles.forEach(role => {
                    try {
                        if (!guildEntry.generalSettings.levelSystem.users[userPos].givenRoles) guildEntry.generalSettings.levelSystem.users[userPos].givenRoles = [];
                        guildEntry.generalSettings.levelSystem.users[userPos].givenRoles.push(role.id);
                        message.member.addRole(role.id, `Reached the required experience level/messages count`)
                    } catch (err) {}
                });
                wonRoles += "and won the role(s) " + roles.map(r => `\`${message.guild.roles.get(r.id).name}\``).join(", ");
            }
            if (message.guild.members.get(client.user.id).hasPermission("sendMessages") && guildEntry.generalSettings.levelSystem.levelUpNotif && guildEntry.generalSettings.levelSystem.users[userPos].level !== curLevel) {
                guildEntry.generalSettings.levelSystem.users[userPos].level = curLevel;
                try {
                    let notifMessage = guildEntry.generalSettings.levelSystem.customNotif ? guildEntry.generalSettings.levelSystem.customNotif
                        .replace(/%USER%/gim, `<@${message.author.id}>`)
                        .replace(/%USERTAG%/gim, message.author.tag)
                        .replace(/%USERNAME%/gim, message.author.username)
                        .replace(/%LEVEL%/gim, curLevel) :
                        `:tada: Congratulations **${message.author.username}**, you leveled up to level **${guildEntry.generalSettings.levelSystem.users[userPos].level}** ${wonRoles}`;
                    if (guildEntry.generalSettings.levelSystem.levelUpNotif === "channel") message.channel.createMessage(notifMessage);
                    else if (guildEntry.generalSettings.levelSystem.levelUpNotif === "dm") message.author.createMessage(notifMessage);
                    else if (message.guild.channels.get(guildEntry.generalSettings.levelSystem.levelUpNotif)) {
                        message.guild.channels.get(guildEntry.generalSettings.levelSystem.levelUpNotif).createMessage(notifMessage);
                    }
                } catch (err) {
                    console.error('An error occurred while trying to notif a user for their level up', err);
                }
            }
        }
        guildEntry.generalSettings.levelSystem.users[userPos].expCount = guildEntry.generalSettings.levelSystem.users[userPos].expCount + expGain;
        client.guildData.set(message.guild.id, guildEntry);
        // Adds the user to the set so the spam wont be counted
        client.talkedRecently.add(message.author.id);
        setTimeout(() => {
            client.talkedRecently.delete(message.author.id);
        }, 30000);
    }
}