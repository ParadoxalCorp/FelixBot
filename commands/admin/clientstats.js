'use strict';

const Command = require('../../util/helpers/Command');

class ClientStats extends Command {
    constructor() {
        super();
        this.help = {
            name: 'clientstats',
            category: 'admin',
            description: 'Get detailed statistics about the bot',
            usage: '{prefix} stats'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ["cs", "botstats"],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message) {
        message.channel.createMessage({
            embed: {
                title: ':gear: Client stats',
                fields: [{
                        name: 'Clusters',
                        value: `Total: ${client.stats.clusters.length}\nActive: ${client.stats.clusters.length - client.stats.clusters.filter(c => c.guilds < 1).length}`,
                        inline: true
                    },
                    {
                        name: 'RAM usage',
                        value: `${client.stats.totalRam.toFixed(2)}MB`,
                        inline: true
                    },
                    {
                        name: 'General stats',
                        value: `Guilds: ${client.stats.guilds} | Cached users: ${client.stats.users} | Large guilds: ${client.stats.largeGuilds}`
                    },
                    {
                        name: 'Clusters stats',
                        value: '```' + client.stats.clusters.map(c => `Cluster ${c.cluster}: ${c.shards} shard(s) | ${c.guilds} guild(s) | ${c.ram.toFixed(2)}MB RAM used | Up for ${client.timeConverter.toElapsedTime(c.uptime, true)}`).join('\n--\n') + '```'
                    }
                ]
            },
            color: client.config.options.embedColor
        });
    }
}

module.exports = new ClientStats();