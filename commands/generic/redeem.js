'use strict';

const Command = require('../../util/helpers/modules/Command');

class Redeem extends Command {
    constructor() {
        super();
        this.help = {
            name: 'redeem',
            category: 'generic',
            description: 'Redeem a donator key on a server',
            usage: '{prefix}redeem <key>'
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
        let entry = await client.database.rethink.db(client.config.database.database).table('keys').get(message.author.id);
        if (!args[0]) {
            if (!entry) {
                return message.channel.createMessage(`:x: You do not have any keys to redeem`);
            } 
            let unredeemedKeys = entry.keys.filter(k => !k.redeemed);
            if (!unredeemedKeys[0]) {
                return message.channel.createMessage(`:x: You do not have any keys left to redeem`);
            }
            return message.channel.createMessage(`You have **${unredeemedKeys.length}** keys left to redeem:\n\n${unredeemedKeys.map(k => '**' + k.key + '**').join('\n')}`);
        }
        const toRedeem = entry ? entry.keys.find(k => k.key === args[0]) : false;
        if (!toRedeem) {
            return message.channel.createMessage(`:x: Invalid key`);
        }
        if (toRedeem.redeemed) {
            return message.channel.createMessage(`:x: This key has already been redeemed`);
        }
        if (guildEntry.hasPremiumStatus()) {
            return message.channel.createMessage(`:x: This server already has premium status enabled`);
        }
        guildEntry.premium = toRedeem.duration ? Date.now() + toRedeem.duration : true;
        toRedeem.redeemed = true;
        toRedeem.redeemedOn = message.channel.guild.id;
        await Promise.all([client.database.rethink.db(client.config.database.database).table('keys').get(message.author.id).replace(entry), client.database.set(guildEntry, 'guild')]);
        return message.channel.createMessage(`:white_check_mark: Successfully redeemed the key and enabled the premium status on this server :heart: ${toRedeem.duration ? ('\n\nThe premium status on this server will expire the ' + client.timeConverter.toHumanDate(guildEntry.premium, true)) : ''}`);
    }
}

module.exports = new Redeem();