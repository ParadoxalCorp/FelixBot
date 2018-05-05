'use strict';

const Command = require('../../util/helpers/modules/Command');

class Market extends Command {
    constructor() {
        super();
        this.help = {
            name: 'market',
            category: 'economy',
            description: 'The place to see and purchase available items with holy coins',
            usage: '{prefix} market'
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
        return client.interactiveList.createPaginatedMessage({
            channel: message.channel,
            userID: message.author.id,
            reactions: [{
                unicode: '🛒',
                callback: this.buyItem.bind(null, client, userEntry)
            }],
            messages: this.mapItems(client, message)
        });
    }

    mapItems(client, message) {
        return client.economyManager.marketItems.map(item => {
            return {
                embed: {
                    title: `Market | ${item.name} ${item.emote ? item.emote : ''}`,
                    description: `**Description** :notepad_spiral:\n${item.description}`,
                    fields: [{
                        name: 'Price :moneybag:',
                        value: `${item.price} holy coins`,
                        inline: true
                    }, {
                        name: 'Unique possession :question:',
                        value: item.buyableOnce ? ':white_check_mark:' : ':x:',
                        inline: true
                    }],
                    footer: {
                        text: `Showing page {index}/${client.economyManager.marketItems.length} ${client.config.admins.includes(message.author.id) ? '| Item ID: ' + item.id : ''}`
                    },
                    image: {
                        url: item.image
                    },
                    color: client.config.options.embedColor

                },
                item: item //Will be used by buyItem
            };
        });
    }

    async buyItem(client, userEntry, message, marketPage) {
        const item = marketPage.item;
        if (item.buyableOnce && userEntry.hasItem(item.id)) {
            return message.channel.createMessage(':x: Sorry but this item is a unique possession and you already own one :v');
        } else if (item.price > userEntry.economy.coins) {
            return message.channel.createMessage(`:x: You need **${item.price - userEntry.economy.coins}** more holy coins to purchase that`);
        }
        userEntry.subtractCoins(item.price);
        userEntry.addItem(item);
        await client.database.set(userEntry, 'user');
        return message.channel.createMessage(`:white_check_mark: The \`${item.name}\` has been added to your belongings, you now have \`${userEntry.economy.coins}\` holy coins`);
    }
}

module.exports = new Market();