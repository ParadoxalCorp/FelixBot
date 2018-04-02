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
            ownerOnly: true
        };
    }

    async run(client, message, args) {
        const wew = await this.getUserFromText({ message: message, client: client, text: args.join(" ") });
        console.log(JSON.stringify(wew, null, 2));
    }
}

module.exports = new Dummy();