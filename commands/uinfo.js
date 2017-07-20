const moment = require('moment');

exports.run = async(client, message) => {
    try {
        const memberavatar = message.author.avatarURL;
        const membername = message.author.username;
        const mentionned = message.mentions.users.first();
        var getValueOf;
        if (mentionned) {
            getValueOf = mentionned;
        } else {
            getValueOf = message.author;
        }
        var userData = client.database.Data.users[0][getValueOf.id];
        if (!userData) {
            userData = {
                lovePoints: 0,
                loveCooldown: 0,
                malAccount: ""
            }
            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                if (err) console.error(err)
            });
        }
        if (getValueOf.bot == true) {
            var checkbot = ":white_check_mark:";
        } else {
            var checkbot = ":x:";
        }
        if (getValueOf.presence.status == 'online') {
            var status = "Online";
        } else {
            var status = "Offline";
        }
        if (getValueOf.presence.status === 'dnd') {
            var status = "Do Not Disturb";
        } else if (getValueOf.presence.status === 'idle') {
            var status = "Idle";
        }
        if (getValueOf.presence.game) {
            var playingStatus = getValueOf.presence.game.name;
        } else {
            var playingStatus = "Nothing";
        }
        /*   var user = message.mentions[0];
           var member = message.channel.guild.members.find(u => u.id === user.id);*/
        return await message.channel.send({
            embed: {
                thumbnail: {
                    url: getValueOf.avatarURL
                },
                color: 3447003,
                author: {
                    name: "Requested by: " + message.author.username + "#" + message.author.discriminator,
                    icon_url: message.author.avatarURL
                },
                title: "User info",
                fields: [{
                        name: "Username",
                        value: getValueOf.username + "#" + getValueOf.discriminator,
                        inline: true
      },
                    {
                        name: "User ID",
                        value: getValueOf.id,
                        inline: true
      },
                    {
                        name: "Status",
                        value: status,
                        inline: true
      },
                    {
                        name: "Bot?",
                        value: checkbot,
                        inline: true
      },
                    {
                        name: "Created",
                        value: moment().to(getValueOf.createdAt),
                        inline: true
      },
                    {
                        name: "Playing",
                        value: playingStatus,
                        inline: true
      },
                    {
                        name: "Joined",
                        value: moment().to(message.guild.members.get(getValueOf.id).joinedAt),
                        inline: true
      },
                    {
                        name: "Roles",
                        value: message.guild.members.get(getValueOf.id).roles.size - 1, //-1 so we dont count the everyone role
                        inline: true
      },
                    {
                        name: "Love points",
                        value: userData.lovePoints,
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
    guildOnly: true,
    aliases: ["userinfo"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'uinfo',
    description: 'Display some infos about a user',
    usage: 'uinfo @someone',
    category: 'generic'
};
