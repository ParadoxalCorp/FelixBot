'use strict';

const Command = require('../../util/helpers/Command');

class Reload extends Command {
    constructor() {
        super();
        this.help = {
            name: 'reload',
            category: 'admin',
            description: 'Reload a module',
            usage: '{prefix} reload <file_path>'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false
        };
    }

    async run(client, message, args) {
        //TODO:
        //Write that shit
    }
}

module.exports = new Reload();