'use strict';

const Command = require('../../util/helpers/modules/Command');

class PlayAfter extends Command {
    constructor() {
        super();
        this.help = {
            name: 'playafter',
            category: 'music',
            description: 'Push to the first position in the queue a song. You can input: A `YouTube` URL (including livestreams), a `Soundcloud` URL, a `Twitch` channel URL (the channel must be live);\n\nOr a search term to search through `YouTube` or `Soundcloud`, by default the search is done on `YouTube`, to search through `Soundcloud`, you must specify it like `{prefix}queue soundcloud <search_term>`',
            usage: '{prefix}playafter <song_url|search_term>'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: [],
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
        let connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!args[0]) {
            if (!connection || !clientMember.voiceState.channelID) {
                return message.channel.createMessage(`:x: I am not playing anything`);
            }
            let queue = await this.formatQueue(client, connection, message, clientMember);
            return message.channel.createMessage(queue);
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
        if (!connection) {
            connection = client.musicManager.connections.get(message.channel.guild.id);
        }
        let tracks = await client.musicManager.resolveTracks(player.node, args.join(' '));
        let queued;
        let track = tracks[0];
        if (!track) {
            return message.channel.createMessage(`:x: I could not find any song :c, please make sure to:\n- Follow the syntax (check \`${client.commands.get('help').getPrefix(client, guildEntry)}help ${this.help.name}\`)\n- Use HTTPS links, unsecured HTTP links aren't supported\n- If a YouTube video, i can't play it if it is age-restricted\n - If a YouTube video, it might be blocked in the country my servers are`);
        }
        if (tracks.length > 1) {
            track = await this.selectTrack(client, message, tracks);
            if (!track) {
                return;
            }
        }
        if (!player.playing && !player.paused) {
            await player.play(track.track);
            connection.nowPlaying = {
                info: { 
                    ...track.info,
                    startedAt: Date.now(),
                    requestedBy: message.author.id
                },
                track: track.track
            };
        } else {
            track.info.requestedBy = message.author.id;
            if (connection.queuePosition) {
                let queue = [...connection.queue];
                let toPlay = queue.splice(connection.queuePosition);
                toPlay.unshift(track);
                connection.queue = queue.concat(toPlay);
            } else {
                connection.queue.unshift(track);
            }
            queued = true;
        }
        return message.channel.createMessage({embed: {
            title: `:musical_note: ${queued ? 'Successfully enqueued to first position' : 'Now playing'}`,
            description: `[${track.info.title}](${track.info.uri})`,
            fields: [{
                name: 'Author',
                value: track.info.author,
                inline: true
            }, {
                name: 'Duration',
                value: client.musicManager.parseDuration(track),
                inline: true
            }],
            color: client.config.options.embedColor
        }});
    }

    async selectTrack(client, message, tracks) {
        tracks = tracks.splice(0, 15);
        let searchResults = `Your search has returned multiple results, please select one by replying their corresponding number\n\n`;
        let i = 1;
        for (const song of tracks) {
            searchResults += `\`${i++}\` - **${song.info.title}** by **${song.info.author}** (${client.musicManager.parseDuration(song)})\n`;
        }
        await message.channel.createMessage(searchResults);
        const reply = await client.messageCollector.awaitMessage(message.channel.id, message.author.id);
        if (!reply) {
            message.channel.createMessage(':x: Timeout, command aborted').catch(() => {});
            return false;
        } else if (!client.isWholeNumber(reply.content)) {
            message.channel.createMessage(':x: You must reply with a whole number').catch(() => {});
            return false;
        }
        if (reply.content >= tracks.length) {
            return tracks[tracks.length - 1];
        } else if (reply.content <= 1) {
            return tracks[0];
        } else {
            return tracks[reply.content - 1];
        }
    }
}

module.exports = new PlayAfter();