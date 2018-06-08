'use strict';

const Command = require('../../util/helpers/modules/Command');

class Invite extends Command {
    constructor() {
        super();
        this.help = {
            name: 'invite',
            category: 'generic',
            description: 'Get Felix\'s invite link',
            usage: '{prefix}invite'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message) {
        message.channel.createMessage(`Here's my invite link :wave: <https://discordapp.com/oauth2/authorize?&client_id=${client.bot.user.id}&scope=bot&permissions=2146950271> \nPlease remember that I might not work perfectly if I dont have all permissions~`);
    }
}

module.exports = new Invite();