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

    async run(client, message) {
        if (client.talkedRecently.has(message.author.id)) return Promise.resolve(false);
        this.guildEntry = client.guildData.get(message.guild.id);
        this.userEntry = client.userData.get(message.author.id) || client.defaultUserData(message.author.id);
        this.memberEntry = this.guildEntry.generalSettings.levelSystem.users.find(u => u.id === message.author.id) || this.defaultMemberEntry(message.author.id);
        this.message = message;
        this.client = client;

        const currentLevel = this.getCurrentLevel(this.memberEntry.level, this.memberEntry.expCount + this.calculateExpGain(message));
        if (currentLevel > this.memberEntry.level) var wonRoles = this._checkRequirement(currentLevel);
        this._updateData(currentLevel, this.calculateExpGain(message));
        if (wonRoles) {
            var updatedRoles = await this._updateUserRoles(wonRoles);
            this._notifyUser(updatedRoles ? updatedRoles.addedRoles : false);
        }
        this._saveData();
        Promise.resolve(true);
    }

    getCurrentLevel(level, exp) {
        const requiredExp = Math.floor(100 * (level ** 2));
        return exp >= requiredExp ? level + 1 : level;
    }

    calculateExpGain(message) {
        let expGain = message.attachments[0] ? Math.round((Number(message.attachments.map(f => f.filesize).join((`+`)))) / 10000) :
            Math.round(1 * message.content.length / 4);
        if (expGain > 75) expGain = 75; //no 500 points messages kthx
        return expGain;
    }

    _checkRequirement(currentLevel) {
        return this.guildEntry.generalSettings.levelSystem.roles.filter(r => (r.method === "experience" && r.at === currentLevel) ||
                (r.method === "message" && this.memberEntry.messages === r.at))
            .filter(r => this.message.guild.roles.has(r.id) && !this.message.guild.members.get(this.message.author.id).roles.find(r => r === r.id));
    }

    _updateUserRoles(roles) {
        return new Promise(async(resolve, reject) => {
            const removeRoles = this.guildEntry.generalSettings.levelSystem.autoRemove ? await this._removeOldRoles() : false;
            const addRoles = await this._addWonRoles(roles);
            resolve({
                addedRoles: addRoles,
                removedRoles: removeRoles
            });
        });
    }

    _addWonRoles(roles) {
        return new Promise(async(resolve, reject) => {
            const addedRoles = [];
            if (!this.message.guild.members.get(this.client.user.id).hasPermission("manageRoles")) return resolve();
            for (let i = 0; i < roles.length; i++) {
                try {
                    await this.message.member.addRole(roles[i].id, "Reached the required experience level/messages count");
                    addedRoles.push(this.message.guild.roles.get(roles[i].id));
                    this.memberEntry.givenRoles.push(roles[i].id);
                } catch (err) {}
            }
            resolve(addedRoles[0] ? addedRoles : false);
        });
    }

    _removeOldRoles() {
        return new Promise(async(resolve, reject) => {
            const removedRoles = [];
            const oldRoles = this.message.member.roles.filter(r => this.guildEntry.generalSettings.levelSystem.roles.find(role => role.id === r) &&
                this.memberEntry.givenRoles && this.memberEntry.givenRoles.find(role => role === r));
            for (let i = 0; i < oldRoles.length; i++) {
                try {
                    await this.message.member.removeRole(oldRoles[i], "Reached a higher experience level/messages count requirement and auto-removal is enabled");
                    removedRoles.push(this.message.guild.roles.get(oldRoles[i]));
                } catch (err) {}
            };
            resolve(removedRoles);
        });
    }

    _notifyUser(wonRoles) {
            try {
                let notifMessage = this.guildEntry.generalSettings.levelSystem.customNotif ? this.guildEntry.generalSettings.levelSystem.customNotif
                    .replace(/%USER%/gim, `<@${this.message.author.id}>`)
                    .replace(/%USERTAG%/gim, this.message.author.tag)
                    .replace(/%USERNAME%/gim, this.message.author.username)
                    .replace(/%LEVEL%/gim, this.memberEntry.level) :
                    `:tada: Congratulations **${this.message.author.username}**, you leveled up to level **${this.guildEntry.generalSettings.levelSystem.users[this.guildEntry.generalSettings.levelSystem.users.findIndex(u => u.id === this.message.author.id)].level}** ${wonRoles ? "and won the roles" + wonRoles.map(r => "`" + r.name + "`").join(", ") : ""}`;
            if (this.guildEntry.generalSettings.levelSystem.levelUpNotif === "channel") this.message.channel.createMessage(notifMessage);
            else if (this.guildEntry.generalSettings.levelSystem.levelUpNotif === "dm") this.message.author.createMessage(notifMessage);
            else if (this.message.guild.channels.get(this.guildEntry.generalSettings.levelSystem.levelUpNotif)) {
                this.message.guild.channels.get(this.guildEntry.generalSettings.levelSystem.levelUpNotif).createMessage(notifMessage);
            }
        } catch (err) {}
    }

    _saveData() {
        this.client.talkedRecently.add(this.message.author.id);
        setTimeout(() => {
            this.client.talkedRecently.delete(this.message.author.id);
        }, this.client.config.options.activityCooldown);
        this.guildEntry.generalSettings.levelSystem.users[this.guildEntry.generalSettings.levelSystem.users.findIndex(u => u.id === this.message.author.id)] = this.memberEntry;
        if (this.client.userData.get(this.message.author.id)) this.client.userData.set(this.message.author.id, this.userEntry);
        this.client.guildData.set(this.message.guild.id, this.guildEntry);
    }

    _updateData(currentLevel, expGain) {
        this.memberEntry.messages++;
        this.memberEntry.level = currentLevel;
        this.memberEntry.expCount = this.memberEntry.expCount + expGain;
        if (!this.guildEntry.generalSettings.levelSystem.users.find(u => u.id === this.memberEntry.id)) {
            this.guildEntry.generalSettings.levelSystem.users.push(this.memberEntry);
        }
        this.userEntry.experience.expCount = this.userEntry.experience.expCount + expGain;
        this.userEntry.experience.level = this.getCurrentLevel(this.userEntry.experience.level, this.userEntry.experience.expCount + expGain);
    }
}

module.exports = new ExperienceHandler();