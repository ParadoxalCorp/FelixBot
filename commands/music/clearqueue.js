'use strict';

const Command = require('../../util/helpers/modules/Command');

class ForceSkip extends Command {
    constructor() {
        super();
        this.help = {
            name: 'clearqueue',
            category: 'music',
            description: 'Clear the queue',
            usage: '{prefix}clearqueue'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['cq'],
            requirePerms: ['voiceConnect', 'voiceSpeak'],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        if (!guildEntry.hasPremiumStatus()) {
            return message.channel.createMessage(':x: Sorry but as they are resources-whores, music commands are only available to our patreon donators. Check the `bot` command for more info');
        }
        const connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!connection || !connection.queue[0]) {
            return message.channel.createMessage(':x: There is nothing in the queue');
        }
        connection.queue = [];
        return message.channel.createMessage(`:white_check_mark: Successfully cleared the queue `);       
    }
}

module.exports = new ForceSkip();