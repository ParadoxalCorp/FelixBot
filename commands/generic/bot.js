class Bot {
    constructor() {
        this.help = {
            name: 'bot',
            description: 'Display some ~~useless~~ info about Felix',
            usage: 'bot',
            category: 'generic'
        }
        this.conf = {
            guildOnly: true,
            aliases: ["sys", "info"]
        }
    }

    run(client, message, args) {
        const moment = require("moment");
        return new Promise(async(resolve, reject) => {
            try {
                let embedFields = [];
                embedFields.push({
                    name: ":desktop: Servers",
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
                embedFields.push({
                    name: ":date: Up since",
                    value: moment().to(client.readyAt),
                    inline: true
                });
                embedFields.push({
                    name: ":wrench: Developer",
                    value: "ParadoxOrigins#5451",
                    inline: true
                });
                embedFields.push({
                    name: ":calendar: Created",
                    value: moment().to(client.user.createdAt),
                    inline: true
                });
                embedFields.push({
                    name: ":calendar: Joined",
                    value: moment().to(message.guild.joinedAt),
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
                if (client.upvoters) {
                    embedFields.push({
                        name: ':+1: Upvotes',
                        value: client.upvoters.length,
                        inline: true
                    });
                }
                return resolve(await message.channel.send({
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