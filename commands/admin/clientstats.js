class ClientStats {
    constructor() {
        this.help = {
            name: 'clientstats',
            usage: 'clientstats',
            description: 'how detailed stats, much wow'
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
                await messageNotice.edit({
                    embed: {
                        fields: [{
                            name: 'Users (cached)',
                            value: `Users: ${users.size}\nBots: ${client.users.size - users.size}\nBots percentage: ${((client.users.size - users.size) / users.size * 100).toFixed(0)}%`,
                            inline: true
                        }, {
                            name: 'Average members/guilds',
                            value: `${Math.round(averageMembers / client.guilds.size)}`,
                            inline: true
                        }, {
                            name: 'Average bots/guilds',
                            value: `${Math.round(averageBots / client.guilds.size)}`,
                            inline: true
                        }, {
                            name: 'Felix users',
                            value: `${client.userData.size} out of ${client.users.size} users (${(client.userData.size / client.users.size * 100).toFixed(0)}%)`,
                            inline: true
                        }]
                    },
                    content: ''
                });
                resolve(await message.channel.createMessage({
                    embed: {
                        description: "```\n" + client.shards.map(s => `Shard ${s.id} | ${s.status} | ${s.latency}ms | ${client.guilds.filter(g => g.shard.id === s.id).size} guilds`).join("\n") + "```"
                    }
                }));
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new ClientStats();