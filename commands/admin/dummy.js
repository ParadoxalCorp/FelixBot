'use strict';

const Command = require('../../util/helpers/modules/Command');

class Dummy extends Command {
    constructor() {
        super();
        this.help = {
            name: 'dummy',
            category: 'admin',
            description: 'dummy',
            usage: '{prefix}dummy'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: true,
            expectedArgs: []
        };
    }

    async run(client, message) {
        return message.channel.createMessage('wew');
    }
}

module.exports = new Dummy();