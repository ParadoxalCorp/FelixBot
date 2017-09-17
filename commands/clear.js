const Discord = require('discord.js');

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!message.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) return resolve(await message.channel.send(':x: I don\'t have the permissions to do that'));
            let args = message.content.split(/\s+/gim);
            args.shift();
            let limit = 2;
            var filtered = new Discord.Collection();
            args.forEach(function(arg) { //Get message count to delete
                if (!isNaN(arg)) {
                    if (arg > 100) return limit = 100;
                    else return limit = Math.round(arg);
                }
            });
            const fetchedMessages = await message.channel.fetchMessages({
                limit: limit
            });
            let filters = false;
            for (let i = 0; i < args.length; i++) {
                if (args[i].startsWith('-')) {
                    filters = true;
                    if (args[i].toLowerCase().includes('b')) { //Filter bots messages
                        filtered = filtered.concat(fetchedMessages.filter(m => m.author.bot));
                    }
                    if (args[i].toLowerCase().includes('u')) { //Filter specified users messages
                        const users = await client.getUserResolvable(message, {
                            guildOnly: true
                        });
                        if (users.size < 1) {
                            filtered = filtered.concat(fetchedMessages.filter(m => m.author.id === message.author.id)); //If no users found then filter author messages
                        } else {
                            filtered = filtered.concat(fetchedMessages.filter(m => users.has(m.author.id)));
                        }
                    }
                }
            }
            if (!filters) filtered = fetchedMessages;
            if (filtered.size < 2) return resolve(await message.channel.send(':x: Not enough messages have been matched with the filter'));
            const deletedMessages = await message.channel.bulkDelete(filtered, {
                filterOld: true
            });
            const deletedMessageNotice = await message.channel.send(`:white_check_mark: Deleted **${deletedMessages.size}** messages`);
            resolve(await deletedMessageNotice.delete(3000));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}
exports.conf = {
    permLevel: 2,
    disabled: false,
    guildOnly: true,
    aliases: ['nuke', 'purge', 'clean']
}
exports.help = {
    name: 'clear',
    description: 'Clear some messages from the current channel',
    usage: 'clear 50',
    parameters: '`-b`, `-u`',
    category: 'moderation',
    detailledUsage: '`{prefix}clear 50` Will clear 50 messages from the current channel\n`{prefix}clear 50 -b` Will clear all bots messages from the 50 last messages\n`{prefix}clear 50 -u user resolvable` Will clear all the messages of the specified users from the 50 last messages\n`{prefix}clear 50 -bu user resolvable` You can combine filters, this will do the same thing that the two above examples combined\n**Notes:** Felix cannot delete messages older than 2 weeks nor more than 100 messages, also, you can specify multiple users'
}