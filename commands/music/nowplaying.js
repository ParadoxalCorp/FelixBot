'use strict';

const Command = require('../../util/helpers/modules/Command');

class NowPlaying extends Command {
    constructor() {
        super();
        this.help = {
            name: 'nowplaying',
            category: 'music',
            description: 'Check the currently playing song',
            usage: '{prefix}nowplaying'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ['np'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        const clientMember = message.channel.guild.members.get(client.bot.user.id);
        if (!clientMember.voiceState.channelID) {
            return message.channel.createMessage(':x: I am not playing anything');
        }
        const connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!connection || !connection.nowPlaying) {
            return message.channel.createMessage(':x: I am not playing anything');
        }
        let track = connection.nowPlaying;
        return message.channel.createMessage({embed: {
            title: `:musical_note: Now playing`,
            description: `[${track.title}](${track.uri})`,
            fields: [{
                name: 'Author',
                value: track.author,
                inline: true
            }, {
                name: 'Duration',
                value: `${client.musicManager.parseDuration(Date.now() - track.startedAt)}/${client.musicManager.parseDuration({info: {...track}})}`,
                inline: true
            }],
            color: client.config.options.embedColor
        }});
    }
}

module.exports = new NowPlaying();