'use strict';

const Command = require('../../util/helpers/modules/Command');

class Shuffle extends Command {
    constructor() {
        super();
        this.help = {
            name: 'shuffle',
            category: 'music',
            description: 'Shuffle the queue',
            usage: '{prefix}shuffle <playlist_link>'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['ap'],
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
        let connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!connection || !connection.queue[0]) {
            return message.channel.createMessage(`:x: There is nothing in the queue to shuffle`);
        }
        connection.queue = connection.queue.sort(() => Math.random() - Math.random());
        return message.channel.createMessage(`:musical_note: Successfully shuffled the queue`);
    }
}

module.exports = new Shuffle();