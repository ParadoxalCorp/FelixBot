'use strict';

class ExperienceHandler {
    constructor(client) {
        this.client = client;
        this.coodowns = new(require('../../modules/collection'))();
        this._sweepInterval = setInterval(sweep.bind(this), client.config.options.experience.sweepInterval);
    }

    handle(message, guildEntry) {
        if (this.coodowns.has(message.author.id)) {
            return;
        }
        const totalSize = message.attachments[0] ? (() => {
            let totalUploadSize = 0;
            for (const file of message.attachments) {
                totalUploadSize = totalUploadSize + file.size;
            }
            return totalUploadSize;
        })() : false;
        const expGain = totalSize ? client.config.options.experience.uploadGainFormula(totalSize) : client.config.options.experience.gainFormula(message.length);
        const expTillNextLevel = Math.floor(this.client.config.options.experience.baseXP * (guildEntry.getLevelOf(message.author.id) ** this.client.config.options.experience.exponent));

        this.addCooldown(client.config.options.experience.cooldown).to(message.author.id);
    }

    sweep() {
        for (const [key, value] of this.coodowns) {
            if (value > Date.now()) {
                this.cooldowns.delete(key);
            }
        }
    }

    addCooldown(duration) {
        return {
            to: (id) => {
                this.coodowns.set(id, Date.now() + duration);
            }
        };
    }
}

module.exports = ExperienceHandler;