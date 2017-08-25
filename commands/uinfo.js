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
        const userEntry = client.userDatas.get(getValueOf.id),
              guildEntry = client.guildDatas.get(message.guild.id);
        embedFields.push({
            name: ":bust_in_silhouette: Username",
            value: getValueOf.username + "#" + getValueOf.discriminator,
            inline: true
        });
        embedFields.push({
            name: ":1234: User ID",
            value: getValueOf.id,
            inline: true
        });
        if (message.guild.member(getValueOf).nickname) {
            embedFields.push({
                name: ":busts_in_silhouette: Nickname",
                value: message.guild.member(getValueOf).nickname,
                inline: true
            });
        }
        if (userEntry.expCount) {
            const levelDetails = client.getLevelDetails(userEntry.level, userEntry.expCount);
            embedFields.push({
                name: ":star: Global experience",
                value: "Level " + userEntry.level + "\nExp: " + Math.round(userEntry.expCount) + `\nLevel progress: ${(levelDetails.levelProgress)}`,
                inline: true
            });
        }
        if (guildEntry.levelSystem && guildEntry.levelSystem.enabled && guildEntry.levelSystem.users.filter(u => u.id === getValueOf.id).length !== 0) {
            const userPos = guildEntry.levelSystem.users.findIndex(function (element) {
                return element.id === getValueOf.id;
            });
            const levelDetails = client.getLevelDetails(guildEntry.levelSystem.users[userPos].level, guildEntry.levelSystem.users[userPos].expCount);            
            embedFields.push({
                name: ":star: Local experience",
                value: "Level " + guildEntry.levelSystem.users[userPos].level + "\nExp: " + Math.round(guildEntry.levelSystem.users[userPos].expCount) + `\nLevel progress: ${(levelDetails.levelProgress)}`,
                inline: true
            });
        }
        if (message.guild.member(getValueOf).hoistRole) {
            embedFields.push({
                name: ":trident: Hoist role",
                value: message.guild.member(getValueOf).hoistRole.name,
                inline: true
            });
        }
        if (message.guild.member(getValueOf).highestRole) {
            embedFields.push({
                name: ":arrow_up_small: Highest Role",
                value: message.guild.member(getValueOf).highestRole.name,
                inline: true
            });
        }
        if (message.guild.member(getValueOf).displayHexColor) {
            embedFields.push({
                name: ":large_blue_diamond: HEX color",
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
            name: ":desktop: Bot",
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
            name: ":red_circle: Status",
            value: status,
            inline: true
        });
        if (getValueOf.presence.game) {
            embedFields.push({
                name: ":video_game: Playing",
                value: getValueOf.presence.game.name,
                inline: true
            });
        }
        embedFields.push({
            name: ":date: Created",
            value: moment().to(getValueOf.createdAt),
            inline: true
        });
        embedFields.push({
            name: ":date: Joined",
            value: moment().to(message.guild.member(getValueOf).joinedAt),
            inline: true
        });
        embedFields.push({
            name: ":notepad_spiral: Roles",
            value: message.guild.member(getValueOf).roles.size - 1, //Dont count the everyone role
            inline: true
        });
        if (client.userDatas.get(getValueOf.id).lovePoints) {
            embedFields.push({
                name: ":heart: Love Points",
                value: client.userDatas.get(getValueOf.id).lovePoints,
                inline: true
            });
        }
        return await message.channel.send({
            embed: {
                image: {
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
    aliases: ["userinfo", "profile"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'uinfo',
    description: 'Display some infos about a user',
    usage: 'uinfo @someone',
    category: 'generic'
};
