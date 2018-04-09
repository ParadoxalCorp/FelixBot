'use strict';

const Command = require('../../util/helpers/Command');

class Balance extends Command {
    constructor() {
        super();
        this.help = {
            name: 'balance',
            category: 'fun',
            description: 'Check your balance',
            usage: '{prefix} balance'
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
        return message.channel.createMessage(`Hai ! You currently have \`${userEntry.economy.coins}\` holy coins`);
    }
}

module.exports = new Balance();