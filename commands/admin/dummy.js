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

    async run(client, message) {
        const { inspect } = require('util');
        const reaction = await client.reactionCollector.awaitReaction(message.channel.id, message.id, message.author.id);
        return message.channel.createMessage('```js\n' + inspect(reaction, { depth: 2 }) + '```');
    }
}

module.exports = new Dummy();