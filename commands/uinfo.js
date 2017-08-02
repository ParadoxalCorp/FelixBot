const moment = require('moment');

exports.run = async(client, message) => {
    try {
        const memberavatar = message.author.avatarURL,
            membername = message.author.username,
            mentionned = message.mentions.users.first();
        var embedFields = [],
            getValueOf,
            checkbot,
            status;
        if (mentionned) {
            getValueOf = mentionned;
        } else {
            getValueOf = message.author;
        }
        embedFields.push({
            name: "Username",
            value: getValueOf.username + "#" + getValueOf.discriminator,
            inline: true
        });
        embedFields.push({
            name: "User ID",
            value: getValueOf.id,
            inline: true
        });
        if (message.guild.member(getValueOf).nickname) {
            embedFields.push({
                name: "Nickname",
                value: message.guild.member(getValueOf).nickname,
                inline: true
            });
        }
        if (message.guild.member(getValueOf).hoistRole) {
            embedFields.push({
                name: "Hoist role",
                value: message.guild.member(getValueOf).hoistRole.name,
                inline: true
            });
        }
        if (message.guild.member(getValueOf).highestRole) {
            embedFields.push({
                name: "Highest Role",
                value: message.guild.member(getValueOf).highestRole.name,
                inline: true
            });
        }
        if (message.guild.member(getValueOf).displayHexColor) {
            embedFields.push({
                name: "HEX color",
                value: message.guild.member(getValueOf).displayHexColor,
                inline: true
            });
        }
        if (getValueOf.bot == true) {
             checkbot = ":white_check_mark:";
        } else {
             checkbot = ":x:";
        }
        embedFields.push({
            name: "Bot",
            value: checkbot,
            inline: true
        });
        if (getValueOf.presence.status == 'online') {
             status = "Online";
        } else {
             status = "Offline";
        }
        if (getValueOf.presence.status === 'dnd') {
             status = "Do Not Disturb";
        } else if (getValueOf.presence.status === 'idle') {
             status = "Idle";
        }
        embedFields.push({
            name: "Status",
            value: status,
            inline: true
        });
        if (getValueOf.presence.game) {
            embedFields.push({
                name: "Playing",
                value: getValueOf.presence.game.name,
                inline: true
            });
        }
        embedFields.push({
            name: "Created",
            value: moment().to(getValueOf.createdAt),
            inline: true
        });
        embedFields.push({
            name: "Joined",
            value: moment().to(message.guild.member(getValueOf).joinedAt),
            inline: true
        });
        embedFields.push({
            name: "Roles",
            value: message.guild.member(getValueOf).roles.size - 1, //Dont count the everyone role
            inline: true
        });
        if (client.userDatas.get(getValueOf.id).lovePoints) {
            embedFields.push({
                name: "Love Points",
                value: client.userDatas.get(getValueOf.id).lovePoints,
                inline: true
            });
        }
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
                fields: embedFields,
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
