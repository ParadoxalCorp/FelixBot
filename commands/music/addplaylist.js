'use strict';

const Command = require('../../util/helpers/modules/Command');

class AddPlaylist extends Command {
    constructor() {
        super();
        this.help = {
            name: 'addplaylist',
            category: 'music',
            description: 'Add a YouTube playlist to the queue, note that the link must be the link to the playlist, not to the first song of the playlist',
            usage: '{prefix}addplaylist <playlist_link>'
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
        if (!guildEntry.hasPremiumStatus()) {
            return message.channel.createMessage(':x: Sorry but as they are resources-whores, music commands are only available to our patreon donators. Check the `bot` command for more info');
        }
        const member = message.channel.guild.members.get(message.author.id);
        const clientMember = message.channel.guild.members.get(client.bot.user.id);
        if (!args[0]) {
            return message.channel.createMessage(':x: You didn\'t specified a playlist link')
        }
        if (!member.voiceState.channelID) {
            return message.channel.createMessage(':x: You are not connected to any voice channel');
        }
        if (!clientMember.voiceState.channelID) {
            if (Array.isArray(this.clientHasPermissions(message, client, ['voiceConnect', 'voiceSpeak'], message.channel.guild.channels.get(member.voiceState.channelID)))) {
                return message.channel.createMessage(':x: It seems like i lack the permission to connect or to speak in the voice channel you are in :c');
            }
        }
        const player = await client.musicManager.getPlayer(message.channel.guild.channels.get(member.voiceState.channelID));
        let connection = client.musicManager.connections.get(message.channel.guild.id);
        let tracks = await client.musicManager.resolveTracks(player.node, args.join(' '));
        if (!tracks[0]) {
            return message.channel.createMessage(`:x: I could not load this playlist :c`);
        }
        if (!player.playing) {
            await player.play(tracks[0].track);
            connection.nowPlaying = {
                info: { 
                    ...tracks[0].info,
                    startedAt: Date.now(),
                    requestedBy: message.author.id
                },
                track: tracks[0].track
            }
            tracks.shift();
        } 
        tracks = tracks.map(track => {
            track.info.requestedBy = message.author.id;
            return track;
        });
        connection.queue = connection.queue.concat(tracks);
        return message.channel.createMessage(`:musical_note: Successfully enqueued the playlist`);
    }
}

module.exports = new AddPlaylist();