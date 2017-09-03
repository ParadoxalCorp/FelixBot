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
                const mentionned = message.mentions.users.first();
                if (!mentionned) {
                    return resolve(await message.channel.send(":x: You did not mentionned any user "));
                }
                const userLevel = client.getPermissionsLevel(message.guild.id, mentionned.id);
                if (!userLevel) {
                    return resolve(await message.channel.send(":x: The mentionned user has not any level"));
                }
                guildEntry.permissionsLevels.things[userLevel].splice(guildEntry.permissionsLevels.things[userLevel].indexOf(mentionned.id), 1);
                client.guildData.set(message.guild.id, guildEntry);
                return resolve(await message.channel.send(":white_check_mark: Alright, i removed the permission level of **" + mentionned.tag + "**"));
            } else if (role) {
                const guildRole = message.guild.roles.find("name", message.content.substr(role.position + role.length + 1).trim());
                if (!guildRole) {
                    return resolve(await message.channel.send(":x: I couldn't find the role you specified, remember to respect case-sensitivity"));
                }
                const roleLevel = client.getPermissionsLevel(message.guild.id, guildRole.id);
                if (!roleLevel) {
                    return resolve(await message.channel.send(":x: The role **" + guildRole.name + "** has not any permission level"));
                }
                guildEntry.permissionsLevels.things[roleLevel].splice(guildEntry.permissionsLevels.things[roleLevel].indexOf(guildRole.id), 1);
                client.guildData.set(message.guild.id, guildEntry);
                return resolve(await message.channel.send(":white_check_mark: Alright, i removed the permission level of the role **" + guildRole.name + "**"));
            } else if (channel) {
                const guildChannel = message.guild.channels.find("name", message.content.substr(channel.position + channel.length + 1).toLowerCase().trim());
                console.log(message.content.substr(channel.position + channel.length + 1).toLowerCase().trim(), channel);
                if (!guildChannel) {
                    return resolve(await message.channel.send(":x: I couldn't find the channel you specified"));
                }
                const channelLevel = client.getPermissionsLevel(message.guild.id, guildChannel.id);
                if (!channelLevel) {
                    return resolve(await message.channel.send(":x: The channel **#" + guildChannel.name + "** has not any permission level"));
                }
                guildEntry.permissionsLevels.things[channelLevel].splice(guildEntry.permissionsLevels.things[channelLevel].indexOf(guildChannel.id), 1);
                client.guildData.set(message.guild.id, guildEntry);
                return resolve(await message.channel.send(":white_check_mark: Alright, i removed the permission level of the channel **#" + guildChannel.name + "**"));
            }
        } catch (err) {
            console.error(err);
            reject(client.Raven.captureException(err));
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
    detailledUsage: '\n`{prefix}removelevel -channel general` Will remove the permission level of the channel **#general**\n`{prefix}removelevel -user @Bob` Will remove the permission level of the user Bob\n`{prefix}removelevel -role Moderators` Will remove the level of the role **Moderators**\nUsing the command without any arguments will remove the level of the server'
};