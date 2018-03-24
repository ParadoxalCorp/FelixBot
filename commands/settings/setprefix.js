'use strict';

const Command = require('../../util/helpers/Command');

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
            guildOnly: true
        };
    }

    async run(client, message, args) {
        const guildEntry = await client.database.getGuild(message.channel.guild.id);
        if (!args[0]) {
            return message.channel.createMessage(`The current prefix on this server is \`${guildEntry.prefix ? guildEntry.prefix : client.config.prefix}\``);
        }
        guildEntry.prefix = args[0];
        const wew = await client.database.set(guildEntry, "guild");
        console.log(wew);
        message.channel.createMessage(`:white_check_mark: Alright, the prefix has successfully been set to \`${args[0]}\`, commands will now look like \`${args[0]} ping\``);
    }
}

module.exports = new SetPrefix();