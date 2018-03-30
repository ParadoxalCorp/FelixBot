'use strict';

const Command = require('../../util/helpers/Command');

class Ping extends Command {
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
        const role = await this.getRoleFromText({ message: message, client: client, text: args.join(" ") });
        console.log(role ? role.name : role);
    }
}

module.exports = new Ping();