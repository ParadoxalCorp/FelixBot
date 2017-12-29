const getLevelDetails = require('./getLevelDetails');

class ExperienceHandler {
    constructor() {
        this.defaultMemberEntry = function(id) {
            return {
                id: id,
                expCount: 0,
                level: 0,
                messages: 0,
                joinedVc: 0,
                leftVc: 0,
                totalVcTime: 0,
                givenRoles: []
            }
        }
    }

    handle(client, message) {
        return new Promise(async(resolve, reject) => {
            if (client.talkedRecently.has(message.author.id)) return resolve(false);
            const guildEntry = client.guildData.get(message.guild.id);
            if (!guildEntry.generalSettings.levelSystem.enabled) return resolve(false);
            const userEntry = client.userData.get(message.author.id) || client.defaultUserData(message.author.id);
            const memberEntry = guildEntry.generalSettings.levelSystem.users.find(u => u.id === message.author.id) || this.defaultMemberEntry(message.author.id);
            //Locally update exp count
            memberEntry.expCount = memberEntry.expCount + this.calculateExpGain(message);
            userEntry.experience.expCount = userEntry.experience.expCount + this.calculateExpGain(message);
            //Calculate changes
            const memberDetails = getLevelDetails(memberEntry.level, memberEntry.expCount);
            const userDetails = getLevelDetails(userEntry.experience.level, userEntry.experience.expCount);

            let wonRoles = this._checkRequirements(client, guildEntry, memberEntry, message, memberDetails.level);
            if (wonRoles) {
                var updatedRoles = await this._updateUserRoles(wonRoles, guildEntry, memberEntry, message, client);
            }
            if (memberDetails.level > memberEntry.level) {
                this._notifyUser(updatedRoles ? updatedRoles.addedRoles : false, guildEntry, message, memberEntry, client);
            }
            //Locally update levels
            memberEntry.level = memberDetails.level;
            userEntry.experience.level = userDetails.level;
            if (!guildEntry.generalSettings.levelSystem.users.find(u => u.id === message.author.id)) {
                guildEntry.generalSettings.levelSystem.users.push(memberEntry);
            }
            //Save data
            client.userData.set(message.author.id, userEntry);
            client.guildData.set(message.guild.id, guildEntry);
            client.talkedRecently.add(message.author.id);
            setTimeout(() => {
                client.talkedRecently.delete(message.author.id);
                resolve(true);
            }, 25000);
        });
    }

    _checkRequirements(client, guildEntry, memberEntry, message, currentLevel) {
        return guildEntry.generalSettings.levelSystem.roles.filter(r => (r.method === "experience" && r.at === currentLevel) ||
                (r.method === "message" && memberEntry.messages === r.at))
            .filter(r => message.guild.roles.has(r.id) && !message.guild.members.get(message.author.id).roles.find(mr => mr === r.id));
    }

    calculateExpGain(message) {
        let expGain = message.attachments[0] ? Math.round((Number(message.attachments.map(f => f.filesize).join((`+`)))) / 10000) :
            Math.round(1 * message.content.length / 4);
        if (expGain > 50) expGain = 50; //no 500 points messages kthx
        return expGain;
    }

    _updateUserRoles(roles, guildEntry, memberEntry, message, client) {
        return new Promise(async(resolve, reject) => {
            const removeRoles = guildEntry.generalSettings.levelSystem.autoRemove ? await this._removeOldRoles(message, guildEntry, memberEntry) : false;
            const addRoles = await this._addWonRoles(roles, memberEntry, message, client);
            resolve({
                addedRoles: addRoles,
                removedRoles: removeRoles
            });
        });
    }

    _addWonRoles(roles, memberEntry, message, client) {
        return new Promise(async(resolve, reject) => {
            const addedRoles = [];
            if (!message.guild.members.get(client.user.id).hasPermission("manageRoles")) return resolve();
            for (let i = 0; i < roles.length; i++) {
                try {
                    await message.member.addRole(roles[i].id, "Reached the required experience level/messages count");
                    addedRoles.push(message.guild.roles.get(roles[i].id));
                    memberEntry.givenRoles.push(roles[i].id);
                } catch (err) {}
            }
            resolve(addedRoles[0] ? addedRoles : false);
        });
    }

    _removeOldRoles(message, guildEntry, memberEntry) {
        return new Promise(async(resolve, reject) => {
            const removedRoles = [];
            const oldRoles = message.member.roles.filter(r => guildEntry.generalSettings.levelSystem.roles.find(role => role.id === r) &&
                memberEntry.givenRoles && memberEntry.givenRoles.find(role => role === r));
            for (let i = 0; i < oldRoles.length; i++) {
                try {
                    await message.member.removeRole(oldRoles[i], "Reached a higher experience level/messages count requirement and auto-removal is enabled");
                    removedRoles.push(message.guild.roles.get(oldRoles[i]));
                } catch (err) {}
            };
            resolve(removedRoles);
        });
    }

    _notifyUser(wonRoles, guildEntry, message, memberEntry, client) {
            try {
                let notifMessage = guildEntry.generalSettings.levelSystem.customNotif ? guildEntry.generalSettings.levelSystem.customNotif
                    .replace(/%USER%/gim, `<@${message.author.id}>`)
                    .replace(/%USERTAG%/gim, message.author.tag)
                    .replace(/%USERNAME%/gim, message.author.username)
                    .replace(/%LEVEL%/gim, memberEntry.level) :
                    `:tada: Congratulations **${message.author.username}**, you leveled up to level **${guildEntry.generalSettings.levelSystem.users[guildEntry.generalSettings.levelSystem.users.findIndex(u => u.id === message.author.id)].level}** ${wonRoles ? "and won the roles" + wonRoles.map(r => "`" + r.name + "`").join(", ") : ""}`;
            if (guildEntry.generalSettings.levelSystem.levelUpNotif === "channel") message.channel.createMessage(notifMessage);
            else if (guildEntry.generalSettings.levelSystem.levelUpNotif === "dm") message.author.createMessage(notifMessage);
            else if (message.guild.channels.get(guildEntry.generalSettings.levelSystem.levelUpNotif)) {
                message.guild.channels.get(guildEntry.generalSettings.levelSystem.levelUpNotif).createMessage(notifMessage);
            }
        } catch (err) {}
    }
}

module.exports = new ExperienceHandler();