'use strict';

const Command = require('../../util/helpers/modules/Command');

class Skip extends Command {
    constructor() {
        super();
        this.help = {
            name: 'skip',
            category: 'music',
            description: 'Start a vote to skip the currently playing song',
            usage: '{prefix}skip'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['voteskip'],
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
        const clientMember = message.channel.guild.members.get(client.bot.user.id);
        const connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!clientMember.voiceState.channelID || !connection || !connection.nowPlaying) {
            return message.channel.createMessage(':x: I am not playing anything');
        }
        if (!connection.voteSkip.count) {
            connection.voteSkip.count = 1;
            connection.voteSkip.callback = this.handleVoteEnd.bind(this, client, message, connection);
            connection.voteSkip.timeout = setTimeout(this.handleVoteEnd.bind(this, client, message, connection, 'timeout'), client.config.options.music.voteSkipDuration);
        } else {
            if (connection.voteSkip.voted.includes(message.author.id)) {
                return message.channel.createMessage(':x: You already voted to skip this song');
            }
            connection.voteSkip.count = connection.voteSkip.count + 1;
        }
        connection.voteSkip.voted.push(message.author.id);
        return this.processVote(client, message, connection);
    }

    async processVote(client, message, connection) {
        const voiceChannel = message.channel.guild.channels.get(message.channel.guild.members.get(client.bot.user.id).voiceState.channelID);
        const userCount = voiceChannel.voiceMembers.filter(m => !m.bot).length;
        if (connection.voteSkip.count >= (userCount === 2 ? 2 : (Math.ceil(userCount / 2)))) {
            const player = await client.musicManager.getPlayer(voiceChannel);
            const skippedSong = await client.musicManager.skipTrack(player, connection);
            connection.voteSkip.count = 0;
            return message.channel.createMessage(`:white_check_mark: Skipped **${skippedSong.info.title}**`);
        }
        return message.channel.createMessage(`:white_check_mark: Successfully registered the vote to skip the song, as there is \`${userCount}\` users listening and already \`${connection.voteSkip.count}\` voted, \`${userCount === 2 ? 1 : Math.ceil(userCount / 2) - connection.voteSkip.count}\` more vote(s) are needed`);
    }

    async handleVoteEnd(client, message, connection, reason) {
        connection.voteSkip.voted = [];
        if (connection.voteSkip.count === 0) {
            return;
        }
        switch (reason) {
            case 'timeout': 
                connection.voteSkip.count = 0;
                return message.channel.createMessage(':x: The vote to skip the current song ended, not enough users voted');
                break;
            case 'songEnded':
                connection.voteSkip.count = 0;
                return message.channel.createMessage(':x: The vote to skip the current song has been cancelled because the song just ended');
                break;
        }
    }
}

module.exports = new Skip();