'use strict';

/**
 * Provides methods related to the economy, such as crediting, debiting or transferring coins
 * @prop {object} client The client instance given when instantiating this class
 * @prop {array<object>} marketItems The market items
 * @prop {array<object>} slotsEvents An array of slots events
 */
class EconomyManager {
    /**
     * @param {*} client - The client instance
     */
    constructor(client) {
        this.client = client;
        this.marketItems = require('../data/marketItems');
        this.slotsEvents = require('../data/slotsEvents')(client, this);
        this.dailyEvents = require('../data/dailyEvents')(client, this);
    }

    /**
     * Transfer coins from one account to another, taking into account the coins limit, so the coins that can't be given because the receiver has hit the limit will be given back
     * @param {object} params An object of parameters
     * @param {object} params.from Who is transferring their coins, aka who will be debited (this has to be the database entry)
     * @param {object} params.to Who is receiving the coins, aka who will be credited (this has to be the database entry)
     * @param {number} params.amount The amount of coins to transfer
     * @returns {Promise<transactionSummary>} A summary of the transaction 
     */
    async transfer(params) {
        const transactionSummary = {
            donor: {
                user: params.from.id,
                debited: (params.to.economy.coins + params.amount) > this.client.config.options.coinsLimit ? params.amount - ((params.to.economy.coins + params.amount) - this.client.config.options.coinsLimit) : params.amount
            },
            receiver: {
                user: params.to.id,
                credited: (params.to.economy.coins + params.amount) > this.client.config.options.coinsLimit ? params.amount - ((params.to.economy.coins + params.amount) - this.client.config.options.coinsLimit) : params.amount
            }
        };
        params.from.economy.coins = params.from.economy.coins - transactionSummary.donor.debited;
        params.to.economy.coins = params.to.economy.coins + transactionSummary.receiver.credited;
        const registeredTransaction = this._registerTransaction(transactionSummary, params.from, params.to);
        await Promise.all([this.client.database.set(registeredTransaction.donor, 'user'), this.client.database.set(registeredTransaction.receiver, 'user')]);
        return transactionSummary;
    }

    /**
     * 
     * @param {*} transactionSummary The summary of the transaction
     * @param {*} donor The donor
     * @param {*} receiver The receiver
     * @returns {{donor: donor, receiver: receiver}} Returns the donor and the receiver entries with the transaction registered
     * @private 
     */
    _registerTransaction(transactionSummary, donor, receiver) {
        donor.economy.transactions.unshift(this.client.refs.transactionData({
            amount: -transactionSummary.donor.debited,
            from: transactionSummary.donor.user,
            to: transactionSummary.receiver.user,
            reason: 'transfer'
        }));
        donor.economy.transactions = donor.economy.transactions.slice(0, 10);
        receiver.economy.transactions.unshift(this.client.refs.transactionData({
            amount: transactionSummary.receiver.credited,
            from: transactionSummary.donor.user,
            to: transactionSummary.receiver.user,
            reason: 'transfer'
        }));
        receiver.economy.transactions = receiver.economy.transactions.slice(0, 10);
        return {
            donor: donor,
            receiver: receiver
        };
    }

    /**
     * Get a market item by its ID
     * @param {number} itemID - The ID of the item
     * @returns {object} The item
     */
    getItem(itemID) {
        return this.marketItems.find(i => i.id === itemID);
    }
}

module.exports = EconomyManager;