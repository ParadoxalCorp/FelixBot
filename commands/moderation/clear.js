class Clear {
    constructor() {
        this.help = {
                name: 'clear',
                description: 'Clear some messages from the current channel',
                usage: 'clear 50',
                detailedUsage: '`{prefix}clear 50` Will clear 50 messages from the current channel\n`{prefix}clear 50 -b` Will clear all bots messages from the 50 last messages\n`{prefix}clear 50 -u [user resolvable]` Will clear all the messages of the specified users from the 50 last messages\n`{prefix}clear 50 -c` Will clear all Felix\'s commands\n`{prefix}clear 50 -bcu [user resolvable]` You can combine filters, this will do the same thing that the two above examples combined\n**Notes:** Felix cannot delete messages older than 2 weeks nor more than 100 messages, also, you can specify multiple users'
            },
            this.conf = {
                guildOnly: true,
                aliases: ['nuke', 'purge', 'clean'],
                requirePerms: ['manageMessages']
            }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            const Eris = require("eris");
            try {
                if (!message.guild.members.get(client.user.id).hasPermission('manageMessages')) return resolve(await message.channel.createMessage(':x: I don\'t have the permissions to do that'));
                let limit = args.filter(a => !isNaN(a)).length > 0 ? (args.filter(a => !isNaN(a))[0] > 100 ? 100 : args.filter(a => !isNaN(a))[0]) : 2;
                let filtered = new Array();
                let fetchedMessages = await message.channel.getMessages(parseInt(limit));
                fetchedMessages = fetchedMessages.filter(m => m.timestamp > (Date.now() - 1209600000)); //Filter messages older than 2 weeks
                let filters = false;
                for (let i = 0; i < args.length; i++) {
                    if (args[i].startsWith('-')) {
                        filters = true;
                        //Filter bots messages
                        if (args[i].toLowerCase().includes('b')) filtered = filtered.concat(fetchedMessages.filter(m => m.author.bot));
                        //Filter specified users messages
                        if (args[i].toLowerCase().includes('u')) {
                            const users = await message.getUserResolvable();
                            filtered = users.size < 1 ? filtered.concat(fetchedMessages.filter(m => m.author.id === message.author.id)) :
                                filtered.concat(fetchedMessages.filter(m => users.has(m.author.id))); //If no users found then filter author messages
                        }
                        //Filter Felix's commands
                        if (args[i].toLowerCase().includes('c')) {
                            filtered = filtered.concat(fetchedMessages.filter(m => m.content.startsWith(client.guildData.get(message.guild.id).generalSettings.prefix) || m.content.startsWith(`<@${client.user.id}>`) || m.content.startsWith(`<@!${client.user.id}>`)));
                        }
                    }
                }
                if (!filters) filtered = fetchedMessages;
                let uniqueMessages = [];
                filtered.forEach(m => {
                    if (!uniqueMessages.find(uniqueMessage => uniqueMessage === m)) uniqueMessages.push(m);
                });
                if (uniqueMessages.length < 2) return resolve(await message.channel.createMessage(':x: Not enough messages have been matched with the filter'));
                const deletedMessages = await message.channel.deleteMessages(uniqueMessages.map(m => m.id));
                message.channel.createMessage(`:white_check_mark: Deleted **${uniqueMessages.length}** messages`).then(m => {
                    setTimeout(() => {
                        resolve(m.delete());
                    }, 3000)
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Clear();