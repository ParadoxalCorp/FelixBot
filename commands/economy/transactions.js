'use strict';

const Command = require('../../util/helpers/modules/Command');

class Transactions extends Command {
    constructor() {
        super();
        this.help = {
            name: 'transactions',
            category: 'economy',
            description: 'See the 10 latest transactions of your account',
            usage: '{prefix}transactions'
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
        if (!userEntry.economy.transactions[0]) {
            return message.channel.createMessage(':x: It seems you did not transferred nor received coins yet, so there\'s no transactions to display :v');
        }
        const splicedTransactions = this.mapSplicedTransactions(client, client.paginate(userEntry.economy.transactions, 4));
        if (splicedTransactions.length < 2) {
            return message.channel.createMessage(splicedTransactions[0]);
        } else {
            return client.interactiveList.createPaginatedMessage({
                channel: message.channel,
                messages: splicedTransactions,
                userID: message.author.id
            });
        }
    }

    mapSplicedTransactions(client, splicedTransactions) {
        return splicedTransactions.map(transactionGroup => {
            return {
                embed: {
                    title: 'Recent transactions',
                    fields: (() => {
                        const fields = [];
                        for (const transaction of transactionGroup) {
                            fields.push({
                                name: client.timeConverter.toHumanDate(transaction.date),
                                value: '```diff\n' + `From: ${this.resolveUser(client, transaction.from).tag}\nTo: ${this.resolveUser(client, transaction.to).tag}\nCoins: ${transaction.amount < 0 ? transaction.amount : '+' + transaction.amount}` + '```',
                            });
                        }
                        return fields;
                    })(),
                    footer: {
                        text: `Showing page ${!splicedTransactions[1] ? '1/1' : '{index}/' + splicedTransactions.length }`
                    },
                    color: client.config.options.embedColor
                }
            };
        });
    }
}

module.exports = new Transactions();