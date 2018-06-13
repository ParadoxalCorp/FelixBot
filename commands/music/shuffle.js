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
            requireDB: false,
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
        const member = message.channel.guild.members.get(message.author.id);
        const clientMember = message.channel.guild.members.get(client.bot.user.id);
        const supportGuild = await client.IPCHandler.fetchGuild('328842643746324481');
        if (supportGuild) {
           const supportMember = supportGuild.members.find(m => m.id === message.author.id);
           if (!supportMember || !supportMember.roles.includes(client.config.options.music.donatorRole)) {
               return message.channel.createMessage(':x: Sorry but as they are ressources-whores, music commands are only available to our patreon donators. Check the `bot` command for more info');
           }
        }
        let connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!connection || !connection.queue[0]) {
            return message.channel.createMessage(`:x: There is nothing in the queue to shuffle`);
        }
        connection.queue = connection.queue.sort((a, b) => Math.random() - Math.random());
        return message.channel.createMessage(`:musical_note: Successfully shuffled the queue`);
    }
}

module.exports = new Shuffle();