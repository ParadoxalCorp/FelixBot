'use strict';
//@ts-check

const Command = require('../../util/helpers/modules/Command');

class Clear extends Command {
    constructor() {
        super();
        this.help = {
            name: 'clear',
            category: 'moderation',
            description: 'Prune messages, the available filters are `-b`, (deletes only bot messages) `-c` (delete commands and their outputs) and `-u` (delete the specified user messages)\n\nSo for example `{prefix}clear 50 -bcu @Baguette` will clear all the bots messages, the commands and the messages from the user `Baguette` in the last 50 messages',
            usage: '{prefix}clear <count> <filters>'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ["clean", "prune"],
            requirePerms: ["manageMessages"],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    // eslint-disable-next-line no-unused-vars
    async run(client, message, args, guildEntry, userEntry) {
        const limit = args[0]; 
        if (!limit || !client.isWholeNumber(limit)) {
            return message.channel.createMessage(`:x: You didn't specified how many messages to delete`);
        }
        let filtered = [];
        const slice = (collection, count) => {
            const newColl = new client.collection();
            const colEntries = new client.collection(collection).sort((a, b) => b.timestamp - a.timestamp).entries();
            for (let i = 0; i < count; i++) {
                const value = colEntries.next().value;
                newColl.set(value[0], value[1]);
            }
            return newColl;
        };
        //Don't fetch the messages if they're already cached, use the cached messages and take only the specified amount
        let fetchedMessages = message.channel.messages.size >= limit ? slice(message.channel.messages, limit) : await message.channel.getMessages(parseInt(limit));
        //Filter messages older than 2 weeks
        fetchedMessages = Array.isArray(fetchedMessages) ? fetchedMessages.filter(m => m.timestamp > (Date.now() - 1209600000)) : fetchedMessages.filterArray(m => m.timestamp > (Date.now() - 1209600000));
        for (const arg of args) {
            if (arg.startsWith('-')) {
                if (arg.toLowerCase().includes('b')) {
                    filtered = filtered.concat(fetchedMessages.filter(m => m.author.bot));
                }
                if (arg.toLowerCase().includes('u')) {
                    const user = await this.getUserFromText({ message: message, client: client, text: args.splice(2).join(' ') });
                    filtered = filtered.concat(fetchedMessages.filter(m => m.author.id === (user ? user.id : message.author.id)));
                }
                if (arg.toLowerCase().includes('c')) {
                    filtered = filtered.concat(fetchedMessages.filter(m => m.author.id === client.bot.user.id));
                    filtered = filtered.concat(fetchedMessages.filter(m => m.content.startsWith(guildEntry ? guildEntry.getPrefix : client.config.prefix) ||
                        m.content.startsWith(`<@${client.bot.user.id}>`) || m.content.startsWith(`<@!${client.bot.user.id}`)));
                }
            }
        }
        let uniqueMessages = filtered[0] ? [] : fetchedMessages.map(m => m.id);

        for (const m of filtered) {
            if (!uniqueMessages.find(msg => msg === m.id)) {
                uniqueMessages.push(m.id);
            }
        }
        if (uniqueMessages.length < 2) { 
            message.channel.createMessage(':x: Not enough messages have been matched with the filter'); 
        }
        await message.channel.deleteMessages(uniqueMessages);
        message.channel.createMessage(`:white_check_mark: Deleted **${uniqueMessages.length}** messages`).then(m => {
            setTimeout(() => {
                m.delete();
            }, 4000);
        });

    }
}

module.exports = new Clear();