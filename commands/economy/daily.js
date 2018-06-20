'use strict';

const Command = require('../../util/helpers/modules/Command');

class Daily extends Command {
    constructor() {
        super();
        this.help = {
            name: 'daily',
            category: 'economy',
            description: 'Get your daily holy coins',
            usage: '{prefix}daily'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        if (userEntry.isInCooldown('dailyCooldown')) {
            return message.channel.createMessage(`Ahhh, i am very sorry but you still have to wait \`${client.timeConverter.toElapsedTime(userEntry.cooldowns.dailyCooldown - Date.now(), true)}\` before using daily again`);
        }
        let randomEvent = client.config.options.economyEvents.dailyEvents ? client.getRandomNumber(1, 100) <= client.config.options.economyEvents.dailyEventsRate : false;
        if (randomEvent) {
            randomEvent = this.runRandomDailyEvent(client, message, userEntry);
        } else {
            userEntry.addCoins(client.config.options.dailyCoins);
            userEntry.addCooldown('dailyCooldown', client.config.options.dailyCooldown);
        }
        await client.database.set(randomEvent ? randomEvent.user : userEntry, "user");
        return message.channel.createMessage(randomEvent ? randomEvent.text : `Hai ! You received \`${client.config.options.dailyCoins}\` holy coins, you now have \`${userEntry.economy.coins}\` holy coins`);
    }

    runRandomDailyEvent(client, message, userEntry) {
        const dailyEvent = client.economyManager.dailyEvents[client.getRandomNumber(0, client.economyManager.dailyEvents.length - 1)];
        const eventCoinsChangeRate = Array.isArray(dailyEvent.changeRate) ? client.getRandomNumber(dailyEvent.changeRate[0], dailyEvent.changeRate[1]) : dailyEvent.changeRate;
        const eventCoinsChange = Math.round(Math.abs(client.config.options.dailyCoins / 100 * eventCoinsChangeRate));
        const conditionalVariant = (() => {
            const conditionalVariants = dailyEvent.conditionalVariants.filter(v => v.condition(userEntry));
            const randomVariant = conditionalVariants[client.getRandomNumber(0, conditionalVariants.length - 1)];
            return randomVariant && randomVariant.context ? randomVariant.context(userEntry) : randomVariant;
        })();
        const conditionalVariantSuccess = conditionalVariant ? client.getRandomNumber(0, 100) < conditionalVariant.successRate : false;
        let resultText = 'Hai ! Here\'s your daily holy coins... Wait... ';
        if (conditionalVariant) {
            resultText += conditionalVariantSuccess ? conditionalVariant.success.replace(/{value}/gim, eventCoinsChange) : conditionalVariant.fail.replace(/{value}/gim, eventCoinsChange);
        } else {
            resultText += dailyEvent.message.replace(/{value}/gim, eventCoinsChange);
        }
        const coinsChange = conditionalVariantSuccess ? client.config.options.dailyCoins : eventCoinsChangeRate > 0 ? client.config.options.dailyCoins + eventCoinsChange : client.config.options.dailyCoins - eventCoinsChange;
        resultText += `\n\n\`${Math.ceil(Math.abs(coinsChange))}\` holy coins have been ${coinsChange > 0 ? 'credited to' : 'debited from'} your account, you now have \`${userEntry.economy.coins + Math.ceil(coinsChange)}\` holy coins`;
        if (coinsChange > 0) {
            userEntry.addCoins(Math.ceil(coinsChange));
        } else {
            userEntry.subtractCoins(Math.ceil(coinsChange));
        }
        return {
            text: resultText,
            user: userEntry
        };
    }
}

module.exports = new Daily();