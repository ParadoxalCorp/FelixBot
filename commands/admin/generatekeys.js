'use strict';

const Command = require('../../util/helpers/modules/Command');

class GenerateKeys extends Command {
    constructor() {
        super();
        this.help = {
            name: 'generatekeys',
            category: 'admin',
            description: 'Generate and register donator keys, omit the `<duration_in_milliseconds>` parameter to generate keys without expiration dates',
            usage: '{prefix}generatekeys <count> | <user_id> | <duration_in_milliseconds>'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        if (!client.database.rethink.db(client.config.database.database).table('keys')) {
            return message.channel.createMessage(`:x: Missing \`keys\` table in database`);
        }
        if (!args[0] || !args[1]) {
            return message.channel.createMessage(`:x: Missing args`);
        }
        let entry = await client.database.rethink.db(client.config.database.database).table('keys').get(args[1]);
        if (!entry) {
            entry = {
                id: args[1],
                keys: []
            };
        }
        let generatedKeys = [];
        for (let i = 0; i < args[0]; i++) {
            let key = `${Buffer.from(args[1]).toString('base64')}-${this.generateKey(client, 16)}-${Buffer.from(Date.now().toString()).toString('base64')}`;
            generatedKeys.push({key, redeemed: false, duration: args[2] ? parseInt(args[2]) : false, redeemedOn: ''});
        }
        entry.keys = entry.keys.concat(generatedKeys);
        await client.database.rethink.db(client.config.database.database).table('keys').get(args[1]).replace(entry);
        return message.channel.createMessage(`:white_check_mark: Successfully generated and registered ${args[0]} keys:\n\n ${generatedKeys.map(k => '**' + k.key + '**').join('\n')} ${args[2] ? ('\n\nFor a duration of ' + client.timeConverter.toElapsedTime(args[2], true)) : ''}`);
    }

    generateKey(client, length) {
        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', '$', 'u', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        let key = '';
        for (let i = 0; i < length; i++) {
            let chosenCharacter;
            let chosenArray = Math.random() > 0.20 ? alphabet : numbers;
            chosenCharacter = chosenArray[client.getRandomNumber(0, chosenArray.length - 1)];
            key += chosenCharacter;
        }
        return Buffer.from(key).toString('base64');
    }
}

module.exports = new GenerateKeys();