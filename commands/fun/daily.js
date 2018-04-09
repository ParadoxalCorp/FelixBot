'use strict';

const Command = require('../../util/helpers/Command');

class Daily extends Command {
    constructor() {
        super();
        this.help = {
            name: 'daily',
            category: 'fun',
            description: 'Get your daily holy coins',
            usage: '{prefix} daily'
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
        if (userEntry.cooldowns.dailyCooldown > Date.now()) {
            return message.channel.createMessage(`Ahhh, im very sorry but you still have to wait \`${client.timeConverter.toElapsedTime(userEntry.cooldowns.dailyCooldown - Date.now(), true)}\` before using daily again`);
        }
        userEntry.economy.coins = userEntry.economy.coins + client.config.options.dailyCoins;
        userEntry.cooldowns.dailyCooldown = Date.now() + client.config.options.dailyCooldown;
        await client.database.set(userEntry, "user");
        return message.channel.createMessage(`Hai ! You received \`${client.config.options.dailyCoins}\` holy coins, you now have \`${userEntry.economy.coins}\` holy coins`);
    }
}

module.exports = new Daily();