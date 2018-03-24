'use strict';

const Command = require('../../util/helpers/Command');

class Ping extends Command {
    constructor() {
        super();
        this.help = {
            name: 'ping',
            category: 'generic',
            description: 'pong',
            usage: '{prefix} ping'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false
        };
    }

    async run(client, message) {
        const startTime = Date.now();
        const messageSent = await message.channel.createMessage(`Baguetting the hell outta Diskurd...`);
        messageSent.edit(`~~Baguette~~ Pong | \`${Date.now() - startTime}\`ms`);
    }
}

module.exports = new Ping();