'use strict';

/**
 * @prop {object} client - The client given in the constructor
 * @prop {array} nodes - An array of nodes
 * @prop {object} regions - A list of locations to use for specific regions 
 */
class MusicManager {
    /**
     * Create a new MusicManager instance; This does not trigger the connection to the Lavalink server, MusicManager.init() serve that purpose
     * @param {*} client - The client instance
     */
    constructor(client) {
        this.client = client;
        this.nodes = [
            { host: client.config.options.music.host, port: client.config.options.music.WSPort, region: 'eu', password: client.config.options.music.password }
        ];
        this.regions = {
            eu: ['eu', 'amsterdam', 'frankfurt', 'russia', 'hongkong', 'singapore', 'sydney'],
            us: ['us', 'brazil'],
        };
        this.baseURL = (node) => `http://${node.host}:${client.config.options.music.port}`;
        this.axios = require('axios').create({});
        this.axios.defaults.headers.common['Accept'] = 'application/json';
        this.connections = new(require('../../modules/collection'))()
    }

    init() {
        const { PlayerManager } = require('eris-lavalink');
        if (!(this.client.bot.voiceConnections instanceof PlayerManager)) {
            this.client.bot.voiceConnections = new PlayerManager(this.client.bot, this.nodes, {
                numShards: this.client.bot.shards.size, // number of shards
                userId: this.client.bot.user.id, // the user id of the bot
                regions: this.regions,
                defaultRegion: 'eu',
            });
        }
    }

    /**
     * Resolve a list of tracks from the given query
     * @param {object} node - The node 
     * @param {string} query - The query
     * @returns {array} An array of resolved tracks
     */
    async resolveTracks(node, query) {
        query = this._parseQuery(query);
        const result = await this.axios.get(`${this.baseURL(node)}/loadtracks?identifier=${query}`, {headers: {'Authorization': node.password}})
            .catch(err => {
                this.client.bot.emit('error', err);
                return false;
            });    
        return result ? result.data : undefined; // array of tracks resolved from lavalink
    }

    /**
     * Get or create a music player for the specified channel
     * @param {object} channel - The Eris channel object (must be a guild voice channel
     * @returns {object} The music player
     */
    async getPlayer(channel) {
        let player = this.client.bot.voiceConnections.get(channel.guild.id);
        let options = {};
        if (channel.guild.region) {
            options.region = channel.guild.region;
        }
        if (!player) {
            player = await this.client.bot.joinVoiceChannel(channel.id, options);
        }
        if (!this.connections.has(channel.guild.id)) {
            this.connections.set(channel.guild.id, {
                queue: [],
                nowPlaying: null,
                voteSkip: {
                    count: 0,
                    callback: null,
                    timeout: null,
                    voted: []
                },
                repeat: 'off',
                queuePosition: 0
            });
        }
        if (!player.listenerCount('disconnect')) {
            player.on('disconnect', this._handleDisconnection.bind(this, player));
        }
        if (!player.listenerCount('error')) {
            player.on('error', this._handleError.bind(this, player));
        }
        if (!player.listenerCount('stuck')) {
            player.on('stuck', this._handleStuck.bind(this, player));
        }
        if (!player.listenerCount('end')) {
            player.on('end', this._handleEnd.bind(this, player));
        }
        if (player.inactivityTimeout) {
            clearTimeout(player.inactivityTimeout);
        }
        return player;
    }

    _handleDisconnection(player, err) {
        if (err) {
            this.client.bot.emit('error', err);
        }
        this.client.bot.leaveVoiceChannel(player.channelId);
    }

    _handleError(player, err) {
        if (err.type === 'TrackExceptionEvent') {
            return this.skipTrack(player, this.connections.get(player.guildId));
        }
        this.client.bot.emit('error', err);
        this.client.bot.leaveVoiceChannel(player.channelId);
    }

    _handleStuck(player, msg) {
        console.log(require('util').inspect(msg, {depth: 2}));
    }

    async _handleEnd(player, data) {
        if (data.reason && data.reason === 'REPLACED') {
            return;
            }
        const connection = this.connections.get(player.guildId);
        const play = async(queuePosition) => {
            await player.play(connection.queue[queuePosition].track);
            connection.nowPlaying = {
                info: { 
                    ...connection.queue[queuePosition].info,
                    startedAt: Date.now()
                },
                track: connection.queue[queuePosition].track
            }
            return;
        }
        switch(connection.repeat) {
            case 'song':
                connection.nowPlaying.startedAt = Date.now();
                return await player.play(connection.nowPlaying.track);
                break;
            case 'queue':
                if (connection.voteSkip.count) {
                    clearTimeout(connection.voteSkip.timeout);
                    connection.voteSkip.callback('songEnded');
                }
                if (!connection.queue[0]) {
                    connection.nowPlaying = null;
                } else {
                    await this._play(player, connection, connection.queuePosition);
                    return connection.queuePosition = connection.queuePosition +1 === connection.queue.length ? 0 : connection.queuePosition +1;
                }
                break;
            case 'off':
                connection.nowPlaying = null;
                if (connection.voteSkip.count) {
                    clearTimeout(connection.voteSkip.timeout);
                    connection.voteSkip.callback('songEnded');
                }
                if (connection.queue.length >= 1)  {
                    await this._play(player, connection, 0);
                    return connection.queue.shift();
                }
                break;
        }
        player.inactivityTimeout = setTimeout(() => {
            console.log(`Voice channel disconnection due to inactivity`);
            this.client.bot.leaveVoiceChannel(player.channelId);
        }, this.client.config.options.music.inactivityTimeout);
    }
    
    /**
     * Parse a song duration and make it human-readable
     * @param {object|number} track - The track object or the duration of the song in milliseconds
     * @returns {string} The human-readable duration of the video
     */
    parseDuration(track) {
        const ms = track.info ? false : track;
        if ((!ms && ms !== 0) && track.info.isStream) {
            return 'Unknown (Live stream)';
        }
        let hours = `${Math.floor(((ms === 0 ? 0 : ms || track.info.length)) / 1000 / 60 / 60)}`;
        let minutes = `${Math.floor(((ms === 0 ? 0 : ms || track.info.length) / 1000) / 60 - (60 * hours))}`;
        let seconds = `${Math.floor(((ms === 0 ? 0 : ms || track.info.length)) / 1000) - (60 * (Math.floor(((ms === 0 ? 0 : ms || track.info.length) / 1000) / 60)))}`;
        if (hours === '0') {
            hours = '';
        }
        if (hours.length === 1) {
            hours = '0' + hours;
        }
        if (minutes === '0') {
            minutes = '00';
        }
        if (minutes.length === 1) {
            minutes = '0' + minutes;
        }
        if (seconds === '0') {
            seconds = '00';
        }
        if (seconds.length === 1) {
            seconds = '0' + seconds;
        }
        return `${hours ? (hours + ':') : hours}${minutes}:${seconds}`;
    }

    _parseQuery(query) {
        const args = query.split(/\s+/g);
        const url = new RegExp(/https:\/\//);
        if (args.length === 1) {
            if (url.test(args[0])) {
                query = query.replace(/<|>/g, '');
            } else {
                query = `ytsearch:${query}`;
            }
        } else {
            if (url.test(query)) {
                for (const arg of args) {
                    if (url.test(arg)) {
                        return query = arg;
                    }
                }
            } 
            query = args[0].toLowerCase() === 'soundcloud' ? `scsearch:${query}` : `ytsearch:${query}`;
        }
        return encodeURIComponent(query);
    }

    /**
     * Skip the currently playing track and start the next one
     * @param {*} player - The player 
     * @param {*} connection - The connection 
     * @returns {object} The skipped track
     */
    async skipTrack(player, connection) {
        const skippedSong = { ...connection.nowPlaying };
        if (connection.queue[0]) {
            if (connection.repeat === 'queue') {
                await this._play(player, connection, connection.queuePosition);
                connection.queuePosition = connection.queuePosition +1 === connection.queue.length ? 0 : connection.queuePosition +1;
            } else {
                await this._play(player, connection, 0);
                connection.queue.shift();
            }
        } else {
            await player.stop();
            connection.nowPlaying = null;
        }
        return skippedSong;
    }

    async _play(player, connection, queuePosition) {
        await player.play(connection.queue[queuePosition].track);
        connection.nowPlaying = {
            info: { 
                ...connection.queue[queuePosition].info,
                startedAt: Date.now()
            },
            track: connection.queue[queuePosition].track
        }
        return;
    }

    disconnect() {
        this.client.bot.voiceConnections.nodes.get(this.client.config.options.music.host).destroy();
    }
}

module.exports = MusicManager;