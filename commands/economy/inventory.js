'use strict';

const Command = require('../../util/helpers/modules/Command');

class Inventory extends Command {
    constructor() {
        super();
        this.help = {
            name: 'inventory',
            category: 'economy',
            description: 'Check the items you possess',
            usage: '{prefix}inventory'
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
        if (!userEntry.economy.items[0]) {
            return message.channel.createMessage(`:x: Sorry, but it seems like you don't own any item yet :c`);
        }
        return message.channel.createMessage(this.mapItems(client, userEntry));
    }

    mapItems(client, userEntry) {
        let ownedItemsWorth = 0;
        for (const item of client.economyManager.marketItems) {
            if (userEntry.hasItem(item.id)) {
                ownedItemsWorth = ownedItemsWorth + item.price;
            }
        }
        return {
            embed: {
                title: ':package: Inventory',
                description: `Your owned items are worth a total of \`${ownedItemsWorth}\` holy coins (including ships).\n\nIf you are looking for your ships, you should check your naval base with the \`navalbase\` command instead`,
                fields: (() => {
                    let familiesOwned = [];
                    for (const item of userEntry.economy.items) {
                        if (!familiesOwned.includes(client.economyManager.getItem(item.id).family) && client.economyManager.getItem(item.id).family !== 'Ships') {
                            familiesOwned.push(client.economyManager.getItem(item.id).family);
                        }
                    }
                    familiesOwned = familiesOwned.map(f => {
                        return {
                            name: `${client.economyManager.marketItems.filter(i => i.family === f)[0].emote} ${f}`,
                            value: client.economyManager.marketItems.filter(i => i.family === f && userEntry.hasItem(i.id)).map(i => `${i.emote} ${i.name} (x${userEntry.economy.items.find(item => item.id === i.id).count})`).join(', ')
                        };
                    });

                    return familiesOwned;
                })(),
                color: client.config.options.embedColor

            }
        };
    }
}

module.exports = new Inventory();