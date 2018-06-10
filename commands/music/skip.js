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
            requireDB: false,
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
        const supportGuild = await client.IPCHandler.fetchGuild('328842643746324481');
        if (supportGuild) {
           const supportMember = supportGuild.members.find(m => m.id === message.author.id);
           if (!supportMember || !supportMember.roles.includes(client.config.options.music.donatorRole)) {
               return message.channel.createMessage(':x: Sorry but as they are ressources-whores, music commands are only available to our patreon donators. Check the `bot` command for more info');
           }
        }
        const clientMember = message.channel.guild.members.get(client.bot.user.id);
        if (!clientMember.voiceState.channelID) {
            return message.channel.createMessage(':x: I am not playing anything');
        }
        const connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!connection || !connection.nowPlaying) {
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
            if (connection.queue[0]) {
                await player.play(connection.queue[0].track);
                const skippedSong = {...connection.nowPlaying};
                connection.nowPlaying = {
                    startedAt: Date.now(),
                    ...connection.queue[0].info
                }
                connection.queue.shift();
                connection.voteSkip.count = 0;
                return message.channel.createMessage(`:white_check_mark: Skipped **${skippedSong.title}**`);
            } else {
                await player.stop();
                connection.voteSkip.count = 0;
                const skippedSong = {...connection.nowPlaying};
                connection.nowPlaying = null;
                return message.channel.createMessage(`:white_check_mark: Skipped **${skippedSong.title}**`);
            }
        }
        return message.channel.createMessage(`:white_check_mark: Successfully registered the vote to keep the song, as there is \`${userCount}\` users listening and already \`${connection.voteSkip.count}\` voted, \`${userCount === 2 ? 1 : Math.ceil(userCount / 2) - connection.voteSkip.count}\` more vote(s) are needed`);
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