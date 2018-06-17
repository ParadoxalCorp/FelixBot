'use strict';

class ExperienceHandler {
    constructor(client) {
        this.client = client;
        this.cooldowns = new(require('../../modules/collection'))();
        this._sweepInterval = setInterval(this._sweep.bind(this), client.config.options.experience.sweepInterval);
        this.levelledUp = new(require('../../modules/collection'))();
    }

    async handle(message, guildEntry, userEntry) {
        if (this.cooldowns.has(message.author.id)) {
            return;
        }
        const totalSize = message.attachments[0] ? (() => {
            let totalUploadSize = 0;
            for (const file of message.attachments) {
                totalUploadSize = totalUploadSize + file.size;
            }
            return totalUploadSize;
        })() : false;
        const expGain = totalSize ? this.client.config.options.experience.uploadGainFormula(totalSize) : this.client.config.options.experience.gainFormula(message.content.length);
        const levelDetails = this.client.getLevelDetails(guildEntry.getLevelOf(message.author.id));
        const totalExperience = guildEntry.addExperience(expGain).to(message.author.id);
        userEntry.addExperience(expGain);
        this._addCooldown(this.client.config.options.experience.cooldown).to(message.author.id);
        await Promise.all([this.client.database.set(guildEntry, 'guild'), this.client.database.set(userEntry, 'user')]);
        if ((totalExperience >= levelDetails.nextLevelExp) && (this.levelledUp.get(message.author.id) !== levelDetails.nextLevel)) {
            this.levelledUp.set(message.author.id, levelDetails.nextLevel);
            this._removeHigherRoles(message, guildEntry, levelDetails);
            const wonRoles = guildEntry.experience.roles.find(r => r.at === levelDetails.nextLevel) ? await this._addWonRoles(message, guildEntry, levelDetails) : false;
            if (guildEntry.experience.notifications.enabled) {
                this._notifyUser(message, guildEntry, levelDetails, wonRoles);
            }
            if (wonRoles) {
                this._removeOlderRoles(message, guildEntry, levelDetails);
            }
        }
        return true;
    }

    _sweep() {
        for (const [key, value] of this.cooldowns) {
            if (value < Date.now()) {
                this.cooldowns.delete(key);
            }
        }
    }

    _addCooldown(duration) {
        return {
            to: (id) => {
                this.cooldowns.set(id, Date.now() + duration);
            }
        };
    }

    async _addWonRoles(message, guildEntry, levelDetails) {
        guildEntry.experience.roles = guildEntry.experience.roles.filter(r => message.channel.guild.roles.has(r.id));
        const member = message.channel.guild.members.get(message.author.id);
        let wonRoles = guildEntry.experience.roles.filter(r => r.at === levelDetails.nextLevel && !member.roles.includes(r.id));
        const handleError = (id) => {
            wonRoles = wonRoles.filter(r => r.id !== id);
        };
        for (let i = 0; i < wonRoles.length; i++) {
            await member.addRole(wonRoles[i].id, `This role is set to be given at the level ${wonRoles[i].at}`)
                .catch(handleError.bind(wonRoles[i].id));
        }
        return wonRoles[0] ? wonRoles.map(r => '`' + message.channel.guild.roles.get(r.id).name + '`') : false;
    }

    async _removeHigherRoles(message, guildEntry, levelDetails) {
        const member = message.channel.guild.members.get(message.author.id);
        const higherRoles = guildEntry.experience.roles.filter(r => member.roles.includes(r.id) && levelDetails.nextLevel < r.at);
        if (higherRoles[0]) {
            for (const role of higherRoles) {
                await member.removeRole(role.id, `This role is set to be given at the level ${role.at} but this member is only level ${levelDetails.nextLevel}`)
                .catch(() => {})
            }
        }
    }

    _notifyUser(message, guildEntry, levelDetails, wonRoles) {
        const user = this.client.extendedUser(message.author);
        const wonRolesNotif = wonRoles ? `and won the role(s) ${wonRoles.join(', ')}` : false;
        let notif = (guildEntry.experience.notifications.message || this.client.config.options.experience.defaultLevelUpMessage)
            .replace(/%USERTAG%/g, user.tag)
            .replace(/%USER%/g, `<@${user.id}>`)
            .replace(/%USERNAME%/g, user.username)
            .replace(/%LEVEL%/g, levelDetails.nextLevel)
            .replace(/%WONROLES%/g, wonRoles ? wonRolesNotif : '');
        if (guildEntry.experience.notifications.channel) {
            if (guildEntry.experience.notifications.channel === 'dm') {
                return user.createMessage(notif).catch(() => {});
            } else if (!message.channel.guild.channels.get(guildEntry.experience.notifications.channel)) {
                return message.channel.createMessage(notif).catch(() => {});
            }
            message.channel.guild.channels.get(guildEntry.experience.notifications.channel).createMessage(notif).catch(() => {});
        } else {
            message.channel.createMessage(notif).catch(() => {});
        }
    }

    async _removeOlderRoles(message, guildEntry, levelDetails) {
        const member = message.channel.guild.members.get(message.author.id);
        const lowerRemovableRoles = guildEntry.experience.roles.filter(r => r.at < levelDetails.nextLevel && !r.static && member.roles.includes(r.id));
        if (lowerRemovableRoles[0]) {
            for (let i = 0; i < lowerRemovableRoles.length; i++) {
                await this.client.sleep(1000);
                member.removeRole(lowerRemovableRoles[i].id).catch(() => {});
            }
        }
    }
}

module.exports = ExperienceHandler;