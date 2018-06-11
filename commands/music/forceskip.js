'use strict';

const Command = require('../../util/helpers/modules/Command');

class ForceSkip extends Command {
    constructor() {
        super();
        this.help = {
            name: 'forceskip',
            category: 'music',
            description: 'Force skip the currently playing song',
            usage: '{prefix}forceskip'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ['fskip'],
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
        const voiceChannel = message.channel.guild.channels.get(message.channel.guild.members.get(client.bot.user.id).voiceState.channelID);
        const player = await client.musicManager.getPlayer(voiceChannel);
        const skippedSong = await client.musicManager.skipTrack(player, connection);
        return message.channel.createMessage(`:white_check_mark: Skipped **${skippedSong.title}**`);       
    }
}

module.exports = new ForceSkip();