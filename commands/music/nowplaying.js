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
            requireDB: true,
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
        if (!guildEntry.hasPremiumStatus()) {
            return message.channel.createMessage(':x: Sorry but as they are resources-whores, music commands are only available to our patreon donators. Check the `bot` command for more info');
        }
        const clientMember = message.channel.guild.members.get(client.bot.user.id);
        if (!clientMember.voiceState.channelID) {
            return message.channel.createMessage(':x: I am not playing anything');
        }
        const connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!connection || !connection.nowPlaying) {
            return message.channel.createMessage(':x: I am not playing anything');
        }
        const player = await client.musicManager.getPlayer(message.channel.guild.channels.get(clientMember.voiceState.channelID));
        let track = connection.nowPlaying;
        const requestedBy = message.channel.guild.members.has(track.info.requestedBy) ? client.extendedUser(message.channel.guild.members.get(track.info.requestedBy).user) : await client.fetchUser(track.info.requestedBy).then(u => client.extendedUser(u));
        return message.channel.createMessage({embed: {
            title: `:musical_note: Now playing`,
            description: `[${track.info.title}](${track.info.uri})`,
            fields: [{
                name: 'Author',
                value: track.info.author,
                inline: true
            }, {
                name: 'Duration',
                value: track.info.isStream ? 'Unknown (Live stream)' : `${client.musicManager.parseDuration(player.state.position)}/${client.musicManager.parseDuration(track)}`,
                inline: true
            }, {
                name: 'Requested by',
                value: requestedBy.tag
            }],
            color: client.config.options.embedColor
        }});
    }
}

module.exports = new NowPlaying();