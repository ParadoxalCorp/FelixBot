const moment = require("moment");

exports.run = async(client, message) => {
    try {
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
                        name: "Developper",
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
                        value: "[Felix invite link](https://discordapp.com/oauth2/authorize?&client_id=327144735359762432&scope=bot&permissions=2146950271)",
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
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
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
