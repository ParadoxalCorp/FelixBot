const TimeConverter = require(`../../util/modules/timeConverter.js`);

class Bot {
    constructor() {
        this.help = {
            name: 'bot',
            description: 'Display some ~~useless~~ info about Felix',
            usage: 'bot'
        }
        this.conf = {
            guildOnly: true,
            aliases: ["sys", "info", "stats"]
        }
    }

    run(client, message, args) {
        const moment = require("moment");
        return new Promise(async(resolve, reject) => {
            try {
                let embedFields = [];
                embedFields.push({
                    name: ":desktop: Servers/Guilds",
                    value: client.guilds.size,
                    inline: true
                });
                embedFields.push({
                    name: ":battery: RAM usage",
                    value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
                    inline: true
                });
                embedFields.push({
                    name: ":tools: OS",
                    value: `${process.platform}-${process.arch}`,
                    inline: true
                });
                embedFields.push({
                    name: ":hammer_pick: Node.js",
                    value: `${process.release.name} ${process.version}`,
                    inline: true
                });
                embedFields.push({
                    name: ":gear: Version",
                    value: client.coreData.version,
                    inline: true
                });
                embedFields.push({
                    name: ":busts_in_silhouette: Users",
                    value: client.users.size,
                    inline: true
                });
                let uptime = TimeConverter.toElapsedTime(client.uptime);
                embedFields.push({
                    name: ":timer: Uptime",
                    value: `${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s`,
                    inline: true
                });
                embedFields.push({
                    name: ":wrench: Developer",
                    value: "ParadoxOrigins#5451",
                    inline: true
                });
                embedFields.push({
                    name: ":calendar: Created",
                    value: `${TimeConverter.toHumanDate(client.user.createdAt)} (${moment().to(client.user.createdAt)})`,
                    inline: true
                });
                embedFields.push({
                    name: ":calendar: Joined",
                    value: `${TimeConverter.toHumanDate(message.guild.joinedAt)} (${moment().to(message.guild.joinedAt)})`,
                    inline: true
                });
                embedFields.push({
                    name: ":incoming_envelope: Support server",
                    value: "[Felix support](https://discord.gg/Ud49hQJ)",
                    inline: true
                });
                embedFields.push({
                    name: ":incoming_envelope: Invite link",
                    value: `[Felix invite link](https://discordapp.com/oauth2/authorize?&client_id=${client.user.id}&scope=bot&permissions=2146950271)`,
                    inline: true
                });
                embedFields.push({
                    name: 'Source',
                    value: `[GitHub repository](https://github.com/ParadoxalCorp/FelixBot)`,
                    inline: true
                });
                embedFields.push({
                    name: 'Support us !',
                    value: '[Patreon](https://www.patreon.com/paradoxorigins)',
                    inline: true
                });
                embedFields.push({
                    name: `:gear: Shard`,
                    value: `${message.guild.shard.id}/${client.shards.size}`,
                    inline: true
                });
                return resolve(await message.channel.createMessage({
                    embed: {
                        thumbnail: {
                            url: client.user.avatarURL
                        },
                        color: 3447003,
                        author: {
                            name: "Requested by: " + message.author.username + "#" + message.author.discriminator,
                            icon_url: message.author.avatarURL
                        },
                        fields: embedFields,
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: message.guild.name
                        }
                    }
                }));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Bot();