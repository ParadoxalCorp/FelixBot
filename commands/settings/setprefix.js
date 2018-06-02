'use strict';

const Command = require('../../util/helpers/modules/Command');

class SetPrefix extends Command {
    constructor() {
        super();
        this.help = {
            name: 'setprefix',
            category: 'settings',
            description: 'Set a custom prefix for commands',
            usage: '{prefix} setprefix <new_prefix>'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ["prefix"],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args) {
        const guildEntry = await client.database.getGuild(message.channel.guild.id);
        if (!args[0]) {
            return message.channel.createMessage(`The current prefix on this server is \`${guildEntry.getPrefix}\``);
        }
        guildEntry.prefix = args[0] === client.config.prefix ? '' : args[0];
        await client.database.set(guildEntry, "guild");
        message.channel.createMessage(`:white_check_mark: Alright, the prefix has successfully been set to \`${args[0]}\`, commands will now look like \`${args[0]} ping\``);
    }
}

module.exports = new SetPrefix();