'use strict';

const Command = require('../../util/helpers/modules/Command');

class Slots extends Command {
    constructor() {
        super();
        this.help = {
            name: 'slots',
            description: 'Gamble your holy coins on your luck, and if you dont have any luck, well, good luck.\n\nYou can use the `--noEmbed` option to send the slots results without an embed, like `{prefix}slots 200 --noEmbed` and the `--noRoll` option to disable roll animations (if any). Note that these options is case-insensitive',
            usage: '{prefix}slots <coins>',
            category: "economy"
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: [],
            cooldownWeight: 2
        };
        this.extra = {
            slotsOutputs: [{
                multiplier: 1,
                name: ":cherries:"
            }, {
                multiplier: 1,
                name: ":french_bread:"
            }, {
                multiplier: 1,
                name: ":beer:"
            }, {
                multiplier: 1,
                name: ":coffee:"
            }, {
                multiplier: 2,
                name: ":gem:"
            }, {
                multiplier: -1,
                name: ":money_with_wings:"
            }, {
                multiplier: -1,
                name: ":bomb:"
            }, {
                multiplier: -1,
                name: ":space_invader:"
            }, {
                multiplier: -1,
                name: ":gun:"
            }, {
                multiplier: -1,
                name: ":coffin:"
            }]
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        if (!args[0]) {
            return message.channel.createMessage(`You currently have \`${userEntry.economy.coins}\` holy coins`);
        }
        const gambledCoins = Number(args[0]);
        if (!client.isWholeNumber(gambledCoins) || gambledCoins <= 0) {
            return message.channel.createMessage(':x: Please input a whole number');
        }
        if (gambledCoins > userEntry.economy.coins) {
            return message.channel.createMessage(`:x: I am very sorry but you only have \`${userEntry.economy.coins}\` holy coins, you can't gamble more than that`);
        }
        const animatedSlots = client.config.options.animatedSlotsEmote && !(new RegExp(/--noRoll/gim).test(message.content)) ? await this.runAnimatedSlots(client, message) : false;
        const slots = this.runSlots(client);
        if (!slots.match) {
            return this.sendResults(client, message, slots, "**Nothing**, you don't lose nor win any holy coins, everyone's happy right?", animatedSlots);
        }
        const randomSlotsEvent = client.getRandomNumber(1, 100) <= client.config.options.economyEvents.slotsEventsRate;
        const coinsChange = Math.round(gambledCoins * (slots.match[0].multiplier * (slots.match.length - 1)));
        if (randomSlotsEvent && client.config.options.economyEvents.slotsEvents) {
            return this.runRandomSlotsEvent(client, message, userEntry, slots, coinsChange, animatedSlots);
        } else if (coinsChange < 0) {
            return this.outputLostGamble(client, message, userEntry, slots, coinsChange, randomSlotsEvent, animatedSlots);
        } else {
            return this.outputWonGamble(client, message, userEntry, slots, coinsChange, randomSlotsEvent, animatedSlots);
        }
    }

    runSlots(client) {
        const getLine = () => { return this.extra.slotsOutputs[client.getRandomNumber(0, this.extra.slotsOutputs.length - 1)]; };
        const results = [getLine()];
        //Increase the chances of having a two-lines match
        results.push(client.getRandomNumber(0, 5) !== 0 ? results[0] : getLine(), getLine());

        return {
            getLine: getLine,
            results: results,
            match: (() => {
                for (const result of results) {
                    if (results.filter(r => r.name === result.name).length >= 2) {
                        return results.filter(r => r.name === result.name);
                    }
                }
                return false;
            })()
        };

    }

    sendResults(client, message, slots, resultText, animatedSlots) {
        const noEmbed = new RegExp(/--noEmbed/gim).test(message.content);
        let slotsResults = "You run the slots, and...\n\n---------------------\n";
        slotsResults += `-| ${slots.getLine().name} | ${slots.getLine().name} | ${slots.getLine().name} |-\n`;
        slotsResults += `>| ${slots.results[0].name} | ${slots.results[1].name}| ${slots.results[2].name} |<\n`;
        slotsResults += `-| ${slots.getLine().name} | ${slots.getLine().name} | ${slots.getLine().name} |-\n\n`;
        slotsResults += `----------------------\n`;
        slotsResults += resultText;
        if (!animatedSlots) {
            return message.channel.createMessage(noEmbed ? slotsResults.replace(/undefined/gim, '') : {
                embed: {
                    title: ":slot_machine: Slots",
                    description: slotsResults.replace(/undefined/gim, ''),
                    color: client.config.options.embedColor
                }
            });
        } else {
            return animatedSlots.edit(noEmbed ? slotsResults.replace(/undefined/gim, '') : {
                embed: {
                    title: ":slot_machine: Slots",
                    description: slotsResults.replace(/undefined/gim, ''),
                    color: client.config.options.embedColor
                }
            });
        }
    }

    runAnimatedSlots(client, message) {
        return new Promise(async(resolve) => {
            const noEmbed = new RegExp(/--noEmbed/gim).test(message.content);
            const animatedEmote = client.config.options.animatedSlotsEmote;
            let slotsResults = "You run the slots, and...\n\n---------------------\n";
            slotsResults += `-| ${animatedEmote} | ${animatedEmote} | ${animatedEmote} |-\n`;
            slotsResults += `>| ${animatedEmote} | ${animatedEmote} | ${animatedEmote} |<\n`;
            slotsResults += `-| ${animatedEmote} | ${animatedEmote} | ${animatedEmote} |-\n\n`;
            slotsResults += `----------------------\n`;
            const animatedSlots = await message.channel.createMessage(noEmbed ? slotsResults.replace(/undefined/gim, '') : {
                embed: {
                    title: ":slot_machine: Slots",
                    description: slotsResults.replace(/undefined/gim, ''),
                    color: client.config.options.embedColor
                }
            });
            setTimeout(() => {
                return resolve(animatedSlots);
            }, 2000);
        });
    }

    async outputLostGamble(client, message, userEntry, slots, lostCoins, randomEvent, animatedSlots) {
        //In case the user lose/win coins during the slots animation, fetch the latest coins amount
        if (animatedSlots) {
            userEntry = await client.database.getUser(userEntry.id);
        }
        userEntry.economy.coins = (userEntry.economy.coins + lostCoins) < 0 ? 0 : userEntry.economy.coins + lostCoins;
        await client.database.set(userEntry, "user");
        const resultText = `${randomEvent ? (randomEvent + '\n\n') : 'You **lose**, '}\`${Math.abs(lostCoins)}\` holy coins has been debited from your account. You now have \`${userEntry.economy.coins}\` holy coins`;
        return this.sendResults(client, message, slots, resultText, animatedSlots);
    }

    async outputWonGamble(client, message, userEntry, slots, wonCoins, randomEvent, animatedSlots) {
        if (animatedSlots) {
            userEntry = await client.database.getUser(userEntry.id);
        }
        wonCoins = Math.ceil(wonCoins);
        userEntry.economy.coins = (userEntry.economy.coins + wonCoins) >= client.config.options.coinsLimit ?
            client.config.options.coinsLimit : userEntry.economy.coins + wonCoins;
        await client.database.set(userEntry, "user");
        const resultText = `${randomEvent ? (randomEvent + '\n\n') : 'You **win**, '}\`${wonCoins}\` holy coins has been credited to your account. You now have \`${userEntry.economy.coins}\` holy coins`;
        return this.sendResults(client, message, slots, resultText, animatedSlots);
    }

    runRandomSlotsEvent(client, message, userEntry, slots, coinsChange, animatedSlots) {
        const filteredSlotsEvents = client.economyManager.slotsEvents.filter(e => e.case === (coinsChange > 0 ? 'won' : 'lost'));
        const slotsEvent = filteredSlotsEvents[client.getRandomNumber(0, filteredSlotsEvents.length - 1)];
        const eventCoinsChangeRate = Array.isArray(slotsEvent.changeRate) ? client.getRandomNumber(slotsEvent.changeRate[0], slotsEvent.changeRate[1]) : slotsEvent.changeRate;
        const eventCoinsChange = Math.round(Math.abs(coinsChange / 100 * eventCoinsChangeRate));
        const conditionalVariant = (() => {
            const conditionalVariants = slotsEvent.conditionalVariants.filter(v => v.condition(userEntry));
            const randomVariant = conditionalVariants[client.getRandomNumber(0, conditionalVariants.length - 1)];
            return randomVariant && randomVariant.context ? randomVariant.context(userEntry) : randomVariant;
        })();
        const conditionalVariantSuccess = conditionalVariant ? client.getRandomNumber(0, 100) < conditionalVariant.successRate : false;
        let resultText;
        let targetFunc;
        if (coinsChange > 0) {
            resultText += 'You **win** ! But... ';
            targetFunc = this.outputWonGamble.bind(this);
        } else {
            resultText += 'You **lose** ! But... ';
            targetFunc = this.outputLostGamble.bind(this);
        }
        if (conditionalVariant) {
            resultText += conditionalVariantSuccess ? conditionalVariant.success.replace(/{value}/gim, eventCoinsChange) : conditionalVariant.fail.replace(/{value}/gim, eventCoinsChange);
        } else {
            resultText += slotsEvent.message.replace(/{value}/gim, eventCoinsChange);
        }
        return targetFunc(client, message, userEntry, slots, conditionalVariantSuccess ? coinsChange : (eventCoinsChangeRate > 0 ? coinsChange + eventCoinsChange : coinsChange - eventCoinsChange), resultText, animatedSlots);
    }
}

module.exports = new Slots();