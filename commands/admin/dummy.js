'use strict';

const Command = require('../../util/helpers/Command');

class Dummy extends Command {
    constructor() {
        super();
        this.help = {
            name: 'dummy',
            category: 'admin',
            description: 'dummy',
            usage: '{prefix} dummy'
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

    async run(client, message, args) {
        console.log("uwu");
    }
}

module.exports = new Dummy();