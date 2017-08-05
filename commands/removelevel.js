const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const guildEntry = client.guildDatas.get(message.guild.id),
            user = client.searchForParameter(message, "user", {aliases: ["-user", "-u"], name: "user"}),
            channelSearch = client.searchForParameter(message, "channel", {aliases: ["-channel", "-chan", "-c"], name: "channel"}),
            roleSearch = client.searchForParameter(message, "role", {aliases: ["-role", "-r"], name: "role"}),
            tips = ["\n\n:information_source: **ProTip**:\nThere are stronger and weaker permissions, the order from strongest to weakest is \nUser > Roles > Channels > Server", "\n\n:information_source: **ProTip**:\n When setting a channel level, dont put anything after the `c` argument to apply the perms to the current channel", "\n\n:information_source: **ProTip**:\n Remember that the level 2 give access to every commands, give it only to the users you trust, and never set a channel or the server level to 2 unless you have a death wish", "\n\n:information_source: **ProTip**:\nIf a user has two roles or more with a different access level, the user access level will be the one of the highest role", "\n\n:information_source: **ProTip**:\nAs long as you have Administrator permissions, you are level 2 by default, there's no way to decrease it", "\n\n:information_source: **ProTip**:\n setLevel overwrites the targetted element(user, channel, role...) level if there is already one, so dont worry about duplicates", "\n\n:information_source: **ProTip**:\nRoles and channels levels are stored using their id, so dont worry, you can edit them as much as you want, it wont affect the level unless you delete it"],
            randomTips = tips[Math.floor(Math.random() * tips.length)];
        if ((user) && (!channelSearch) && (!roleSearch)) {
            const mentionned = message.mentions.users.first();
            if (!mentionned) {
                return await message.channel.send(":x: You didnt mentionned any user");
            }
            const level = client.getLevel(mentionned.id);
            if (!level) {
                return await message.channel.send(":x: The user you specified has not any level");
            }
            level.splice(level.indexOf(mentionned.id), 1);
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(`:white_check_mark: Alright, i removed the level of **${mentionned.username}**${randomTips}`);
        } else if ((channelSearch) && (!roleSearch) && (!user)) {
            const channelName = message.content.substr(channelSearch.position + channelSearch.length + 1).trim();
            var channel;
            if (channelName === "") {
                channel = message.guild.channels.get(message.channel.id);
            } else {
                if (!message.guild.channels.find("name", channelName.toLowerCase())) {
                    return await message.channel.send(":x: The channel you specified does not exist");
                }
                channel = message.guild.channels.find("name", channelName.toLowerCase());
            }
            const level = client.getLevel(channel.id);
            if (!level) {
                return await message.channel.send(":x: The channel you specified has not any level");
            }
            level.splice(level.indexOf(channel.id), 1);
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(`:white_check_mark: Alright, i removed the level of the channel **${channel.name}**${randomTips}`);
        } else if ((roleSearch) && (!channelSearch) && (!user)) {
            const roleName = message.content.substr(roleSearch.position + roleSearch.length + 1).trim();
            if (roleName === "") {
                return await message.channel.send(":x: You didnt specified any role");
            }
            if (!message.guild.roles.find("name", roleName)) {
                return await message.channel.send(":x: The role you specified does not exist");
            }
            const role = message.guild.roles.find("name", roleName),
                level = client.getLevel(role.id);
            if (!level) {
                return await message.channel.send(":x: The role you specified has not any level");
            }
            level.splice(level.indexOf(role.id), 1);
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(`:white_check_mark: Alright, i removed the level of the role **${roleName}**${randomTips}`);
        } else if ((!roleSearch) && (!channelSearch) && (!user)) {
            if (guildEntry.globalLevel === "none") {
                return await message.channel.send(":x: The server has not any level");
            }
            guildEntry.globalLevel = "none";
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, i removed the server level");
        }
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
    aliases: ["rl"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'removelevel',
    parameters: '`-u`(user), `-r`(role), `-c`(channel)',
    description: 'Remove the current level of the targetted element(channel, role, user...)',
    usage: 'removelevel -u @mention',
    category: 'moderation',
    detailledUsage: '`{prefix}removelevel` Will remove the server level\n`{prefix}removelevel -c general` Will remove the level of the channel `#general`\n`{prefix}removelevel -r Moderators` Will remove the level of the role `Moderators`'
};
