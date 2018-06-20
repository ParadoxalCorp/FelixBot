'use strict';

const Command = require('../../util/helpers/modules/Command');

class SimulateGreetings extends Command {
    constructor() {
        super();
        this.help = {
            name: 'simulategreetings',
            category: 'settings',
            description: 'Simulate the greetings with you as the new member',
            usage: '{prefix}simulategreetings'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        if (!guildEntry.greetings.enabled) {
            return message.channel.createMessage(':x: The greetings are not enabled');
        }
        if (!guildEntry.greetings.message) {
            return message.channel.createMessage(':x: There is no greetings message set');
        }
        if (!guildEntry.greetings.channel || (guildEntry.greetings.channel !== 'dm' && !message.channel.guild.channels.has(guildEntry.greetings.channel))) {
            return message.channel.createMessage(':x: The greetings\'s message target is not set');
        }
        client.bot.emit('guildMemberAdd', message.channel.guild, message.channel.guild.members.get(message.author.id));
        return message.channel.createMessage(client.commands.get('setgreetings')._checkPermissions(client, message, guildEntry));
    }
}

module.exports = new SimulateGreetings();