exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        const guildEntry = client.guildData.get(message.guild.id);
        try {
            const user = await client.searchForParameter({
                message: message,
                parameter: "user"
            });
            const channel = await client.searchForParameter({
                message: message,
                parameter: "channel"
            });
            const role = await client.searchForParameter({
                message: message,
                parameter: "role"
            });
            if (!user && !channel && !role) {
                if (guildEntry.permissionsLevels.globalLevel === "none") {
                    return resolve(await message.channel.send(":x: There's no permission level set for the server"));
                } else {
                    guildEntry.permissionsLevels.globalLevel = "none";
                    client.guildData.set(message.guild.id, guildEntry);
                    return resolve(await message.channel.send(":white_check_mark: Alright, i removed the permission level of the server"));
                }
            } else if (user) {
                const users = await client.getUserResolvable(message, {
                    guildOnly: true
                });
                if (users.size === 0) {
                    return resolve(await message.channel.send(":x: You did not specified any user(s) or i couldn't find the user(s) you specified "));
                }
                if (users.size > 10) {
                    return resolve(await message.channel.send(":x: I cant remove the permissions level of more than 10 peoples"));
                }
                users.forEach(function(usr) {
                    const userLevel = client.getPermissionsLevel(message.guild.id, usr.id);
                    if (userLevel !== false) {
                        guildEntry.permissionsLevels.things[userLevel].splice(guildEntry.permissionsLevels.things[userLevel].indexOf(usr.id), 1);
                    } else {
                        users.delete(usr.id);
                    }
                });
                if (users.size === 0) { //If none of them actually had a level
                    return resolve(await message.channel.send(":x: The specified user(s) don't have any permissions level"));
                }
                client.guildData.set(message.guild.id, guildEntry);
                return resolve(await message.channel.send(":white_check_mark: Alright, i removed the permission level of **" + users.map(u => u.tag).join(", ") + "**"));
            } else if (role) {
                const guildRole = message.guild.roles.find("name", message.content.substr(role.position + role.length + 1).trim());
                if (!guildRole) {
                    return resolve(await message.channel.send(":x: I couldn't find the role you specified, remember to respect case-sensitivity"));
                }
                const roleLevel = client.getPermissionsLevel(message.guild.id, guildRole.id);
                if (!roleLevel && roleLevel !== 0) {
                    return resolve(await message.channel.send(":x: The role **" + guildRole.name + "** has not any permission level"));
                }
                guildEntry.permissionsLevels.things[roleLevel].splice(guildEntry.permissionsLevels.things[roleLevel].indexOf(guildRole.id), 1);
                client.guildData.set(message.guild.id, guildEntry);
                return resolve(await message.channel.send(":white_check_mark: Alright, i removed the permission level of the role **" + guildRole.name + "**"));
            } else if (channel) {
                const guildChannel = message.guild.channels.find("name", message.content.substr(channel.position + channel.length + 1).toLowerCase().trim());
                if (!guildChannel) {
                    return resolve(await message.channel.send(":x: I couldn't find the channel you specified"));
                }
                const channelLevel = client.getPermissionsLevel(message.guild.id, guildChannel.id);
                if (!channelLevel && channelLevel !== 0) {
                    return resolve(await message.channel.send(":x: The channel **#" + guildChannel.name + "** has not any permission level"));
                }
                guildEntry.permissionsLevels.things[channelLevel].splice(guildEntry.permissionsLevels.things[channelLevel].indexOf(guildChannel.id), 1);
                client.guildData.set(message.guild.id, guildEntry);
                return resolve(await message.channel.send(":white_check_mark: Alright, i removed the permission level of the channel **#" + guildChannel.name + "**"));
            }
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: ["rl"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'removelevel',
    parameters: '`-user`, `-channel`, `-role`',
    description: 'Remove the level of a user/channel/role or from the server itself',
    usage: 'removelevel',
    category: 'generic',
    detailledUsage: '\n`{prefix}removelevel -channel general` Will remove the permission level of the channel **#general**\n`{prefix}removelevel -user user resolvable` Will remove the permission level of the user Bob\n`{prefix}removelevel -role Moderators` Will remove the level of the role **Moderators**\nUsing the command without any arguments will remove the level of the server'
};