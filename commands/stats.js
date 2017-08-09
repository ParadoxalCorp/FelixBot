const moment = require("moment");

exports.run = async(client, message) => {
    try {
        /*var total = 0; disabled due to memory leaks
        const guilds = client.guilds.array();
        for (let i = 0; i < guilds.length; i++) {
            total = total + guilds[i].memberCount;
        }*/
        return await message.channel.send({
            embed: {
                thumbnail: {
                    url: client.user.avatarURL
                },
                color: 3447003,
                author: {
                    name: "Requested by: " + message.author.username + "#" + message.author.discriminator,
                    icon_url: message.author.avatarURL
                },
                title: "Bot info",
                fields: [{
                        name: "Servers",
                        value: client.guilds.size,
                        inline: true
      },
                    {
                        name: "RAM usage",
                        value: `${(process.memoryUsage().heapUsed / 1024 / 1000).toFixed(2)}MB`,
                        inline: true
      }, {
                        name: "OS",
                        value: `${process.platform}-${process.arch}`,
                        inline: true
      },
                    {
                        name: "Node",
                        value: `${process.release.name} ${process.version}`,
                        inline: true
      },
                    {
                        name: "Version",
                        value: client.database.Data.global[0].version,
                        inline: true
      },
                    {
                        name: "Channels",
                        value: client.channels.size,
                        inline: true
      },
                    {
                        name: "Users",
                        value: client.users.size,
                        inline: true
      },
                    {
                        name: "Up since",
                        value: moment().to(client.readyAt),
                        inline: true
      },
                    {
                        name: "Developer",
                        value: "ParadoxOrigins#5451",
                        inline: true
      },
                    {
                        name: "Created",
                        value: moment().to(client.user.createdAt),
                        inline: true
      },
                    {
                        name: "Joined",
                        value: moment().to(message.guild.joinedAt),
                        inline: true
      },
                    {
                        name: "Support server",
                        value: "[Felix support](https://discord.gg/Ud49hQJ)",
                        inline: true
      },
                    {
                        name: "Invite link",
                        value: `[Felix invite link](https://discordapp.com/oauth2/authorize?&client_id=${client.user.id}&scope=bot&permissions=2146950271)`,
                        inline: true
      }
    ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: message.guild.name
                }
            }
        }).catch(console.error);
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["bot", "felixinfo"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'stats',
    description: 'Display some infos about Felix',
    usage: 'stats',
    category: 'generic'
};
