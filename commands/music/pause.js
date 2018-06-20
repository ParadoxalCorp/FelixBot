'use strict';

const Command = require('../../util/helpers/modules/Command');

class Pause extends Command {
    constructor() {
        super();
        this.help = {
            name: 'pause',
            category: 'music',
            description: 'Pause or resume the playback',
            usage: '{prefix}pause'
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
        const clientMember = message.channel.guild.members.get(client.bot.user.id);
        const connection = client.musicManager.connections.get(message.channel.guild.id);
        if (!clientMember.voiceState.channelID || !connection || !connection.nowPlaying) {
            return message.channel.createMessage(':x: I am not playing anything');
        }
        const voiceChannel = message.channel.guild.channels.get(clientMember.voiceState.channelID);
        const player = await client.musicManager.getPlayer(voiceChannel);
        await player.setPause(player.paused ? false : true);
        return message.channel.createMessage(`:white_check_mark: Successfully ${player.paused ? 'paused' : 'resumed'} the playback`);       
    }
}

module.exports = new Pause();