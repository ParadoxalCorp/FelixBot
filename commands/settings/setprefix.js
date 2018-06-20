'use strict';

const Command = require('../../util/helpers/modules/Command');

class SetPrefix extends Command {
    constructor() {
        super();
        this.help = {
            name: 'setprefix',
            category: 'settings',
            description: 'Set a custom prefix for commands, if you want the prefix to not contain a space between the prefix and the command, use `{prefix}setprefix <new_prefix> unspaced` so like `{prefix}setprefix ! unspaced` will make commands look like `!ping`',
            usage: '{prefix}setprefix <new_prefix> <unspaced>'
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

    async run(client, message, args, guildEntry) {
        const spaced = (args[1] ? args[1].toLowerCase() : args[1]) === 'unspaced' ? false : true;
        if (!args[0]) {
            return message.channel.createMessage(`The current prefix on this server is \`${guildEntry.getPrefix}\``);
        }
        if (args[0] === `<@${client.bot.user.id}>` || args[0] === `<@!${client.bot.user.id}>`) {
            return message.channel.createMessage(`:x: Ahhh yes but no im sorry this prefix cannot be chosen`);
        }
        guildEntry.prefix = (args[0] === client.config.prefix) && spaced ? '' : args[0];
        guildEntry.spacedPrefix = spaced;
        await client.database.set(guildEntry, "guild");
        return message.channel.createMessage(`:white_check_mark: Alright, the prefix has successfully been set as a ${spaced ? 'spaced' : 'unspaced'} prefix to \`${args[0]}\`, commands will now look like \`${args[0] + (spaced ? ' ' : '')}ping\``);
    }
}

module.exports = new SetPrefix();