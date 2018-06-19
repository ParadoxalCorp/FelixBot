'use strict';

const Command = require('../../util/helpers/modules/Command');

class DisableKeys extends Command {
    constructor() {
        super();
        this.help = {
            name: 'disablekeys',
            category: 'admin',
            description: 'Disable all keys, redeemed and unredeemed, of a user',
            usage: '{prefix}disablekeys <user_id>'
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
        if (!client.database.rethink.db(client.config.database.database).table('keys')) {
            return message.channel.createMessage(`:x: Missing \`keys\` table in database`);
        }
        let entry = await client.database.rethink.db(client.config.database.database).table('keys').get(args[0]);
        if (!entry) {
            return message.channel.createMessage(':x ablalblalbllblekgllblr (user not found)');
        }
        for (const key of entry.keys) {
            if (key.redeemedOn) {
                const guild = await client.database.getGuild(key.redeemedOn);
                guild.premium = '';
                await client.database.set(guild, 'guild');
            }
        }
        await client.database.rethink.db(client.config.database.database).table('keys').get(args[0]).delete();
        return message.channel.createMessage(`:white_check_mark: Successfully disabled all keys of the user`);
    }
}

module.exports = new DisableKeys();