'use strict';

const Command = require('../../util/helpers/modules/Command');
const TimeConverter = require(`../../util/modules/timeConverter.js`);
const moment = require("moment");

class Bot extends Command {
    constructor() {
        super();
        this.help = {
            name: 'bot',
            category: 'generic',
            description: 'Display some ~~useless~~ info about Felix',
            usage: '{prefix}bot'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ["sys", "info", "stats"],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message) {
        if (client.bot.uptime < 60000) {
            return message.channel.createMessage(':x: I am still booting up ! Please try again in a minute');
        }
        return this.sendStats(client, message);
    }

    sendStats(client, message) {
        return message.channel.createMessage({
            embed: {
                thumbnail: {
                    url: client.bot.user.avatarURL
                },
                color: client.config.options.embedColor,
                author: {
                    name: "Requested by: " + message.author.username + "#" + message.author.discriminator,
                    icon_url: message.author.avatarURL
                },
                fields: this.buildEmbedFields(client, message),
                timestamp: new Date(),
                footer: {
                    icon_url: client.bot.user.avatarURL,
                    text: message.channel.guild.name
                }
            }
        });
    }

    buildEmbedFields(client, message) {
        let embedFields = [];
        embedFields.push({
            name: "Servers/Guilds",
            value: client.bot.guilds.size,
            inline: true
        });
        embedFields.push({
            name: "RAM usage",
            value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
            inline: true
        });
        embedFields.push({
            name: "OS",
            value: `${process.platform}-${process.arch}`,
            inline: true
        });
        embedFields.push({
            name: "Node.js",
            value: `${process.release.lts ? process.release.lts : ''} ${process.version}`,
            inline: true
        });
        embedFields.push({
            name: "Version",
            value: client.package.version,
            inline: true
        });
        embedFields.push({
            name: "Cached users",
            value: client.bot.users.size,
            inline: true
        });
        let uptime = TimeConverter.toElapsedTime(client.bot.uptime);
        embedFields.push({
            name: "Uptime",
            value: `${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s`,
            inline: true
        });
        embedFields.push({
            name: "Developer",
            value: "ParadoxOrigins#5451",
            inline: true
        });
        embedFields.push({
            name: "Created the",
            value: `${TimeConverter.toHumanDate(client.bot.user.createdAt)} (${moment().to(client.bot.user.createdAt)})`,
            inline: true
        });
        embedFields.push({
            name: "Joined this server the",
            value: `${TimeConverter.toHumanDate(message.channel.guild.joinedAt)} (${moment().to(message.channel.guild.joinedAt)})`,
            inline: true
        });
        embedFields.push({
            name: "Join the support server !",
            value: "[Felix support server invite link](https://discord.gg/Ud49hQJ)",
            inline: false
        });
        embedFields.push({
            name: "Invite Felix to your server",
            value: `[Felix's invite link](https://discordapp.com/oauth2/authorize?&client_id=${client.bot.user.id}&scope=bot&permissions=2146950271)`,
            inline: false
        });
        embedFields.push({
            name: 'Source',
            value: `[GitHub repository](https://github.com/ParadoxalCorp/FelixBot)`,
            inline: false
        });
        embedFields.push({
            name: 'Support us and become a donator !',
            value: '[Patreon](https://www.patreon.com/paradoxorigins)',
            inline: false
        });
        embedFields.push({
            name: `Shard`,
            value: (() => {
                let shardCount = 0;
                for (const cluster of client.stats.clusters) {
                    shardCount = shardCount + cluster.shards;
                }
                return `${message.channel.guild.shard.id}/${shardCount}`;
            })(),
            inline: true
        });
        embedFields.push({
            name: 'Database status',
            value: client.database && client.database.healthy ? ':white_check_mark: Online' : ':x: Offline',
            inline: true
        });
        return embedFields;
    }
}

module.exports = new Bot();