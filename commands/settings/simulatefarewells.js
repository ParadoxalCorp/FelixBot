'use strict';

const Command = require('../../util/helpers/modules/Command');

class SimulateFarewells extends Command {
    constructor() {
        super();
        this.help = {
            name: 'simulatefarewells',
            category: 'settings',
            description: 'Simulate the farewells with you as the leaving member',
            usage: '{prefix}simulatefarewells'
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
        if (!guildEntry.farewells.enabled) {
            return message.channel.createMessage(':x: The farewell are not enabled');
        }
        if (!guildEntry.farewells.message) {
            return message.channel.createMessage(':x: There is no farewell message set');
        }
        if (!guildEntry.farewells.channel || (guildEntry.farewells.channel !== 'dm' && !message.channel.guild.channels.has(guildEntry.farewells.channel))) {
            return message.channel.createMessage(':x: The farewell\'s message target is not set');
        }
        client.bot.emit('guildMemberRemove', message.channel.guild, message.channel.guild.members.get(message.author.id));
        return message.channel.createMessage(client.commands.get('setfarewells')._checkPermissions(client, message, guildEntry));
    }
}

module.exports = new SimulateFarewells();