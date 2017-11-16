class ClientStats {
    constructor() {
        this.help = {
            name: 'clientstats',
            category: 'admin',
            usage: 'clientstats',
            description: 'how detailled stats, much wow'
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                let messageNotice = await message.channel.createMessage(`Fetching data...`);
                let users = client.users.filter(u => !u.bot);
                let averageMembers = 0;
                client.guilds.forEach(g => { averageMembers = averageMembers + g.members.size });
                let averageBots = 0;
                client.guilds.forEach(g => { averageBots = averageBots + g.members.filter(m => m.user.bot).size });
                resolve(await client.editMessage(message.channel.id, messageNotice.id, {
                    embed: {
                        fields: [{
                            name: 'Users (cached)',
                            value: `Users: ${users.size}\nBots: ${client.users.size - users.size}\nBots percentage: ${((client.users.size - users.size) / users.size * 100).toFixed(0)}%`,
                            inline: true
                        }, {
                            name: 'Average members/guilds',
                            value: `${averageMembers / client.guilds.size}`,
                            inline: true
                        }, {
                            name: 'Average bots/guilds',
                            value: `${averageBots / client.guilds.size}`,
                            inline: true
                        }, {
                            name: 'Felix users',
                            value: `${client.userData.size} out of ${client.users.size} users (${(client.userData.size / client.users.size * 100).toFixed(0)}%)`,
                            inline: true
                        }]
                    }
                }))
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new ClientStats();