'use strict';

const Command = require('../../util/helpers/modules/Command');

class Ping extends Command {
    constructor() {
        super();
        this.help = {
            name: 'ping',
            category: 'generic',
            description: 'pong',
            usage: '{prefix}ping'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        const startTime = Date.now();
        const messageSent = await message.channel.createMessage(`Baguetting the hell outta Diskurd...`);
        return messageSent.edit(`~~Baguette~~ Pong | \`${Date.now() - startTime}\`ms`);
    }
}

module.exports = new Ping();