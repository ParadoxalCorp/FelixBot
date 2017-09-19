exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/gim);
            args.shift();
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.generalSettings.autoAssignablesRoles = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.get(r)); //Filter deleted roles
            if (args.length < 1) {
                if (guildEntry.generalSettings.autoAssignablesRoles.length < 1) return resolve(await message.channel.send(":x: There is no self-assignable role set on this server"));
                let roleList = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.has(r)).map(r => message.guild.roles.get(r).name);
                const paginatedRoleList = await client.pageResults({
                    results: roleList
                });
                await client.createInteractiveMessage(message, {
                    description: `Here's the list of the self-assignables roles set on this server`,
                    content: paginatedRoleList.results
                });
                resolve(true);
            } else {
                if (!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return resolve(await message.channel.send(":x: I don't have the permission to do that"));
                let guildRole = message.guild.roles.find('name', args.join(" "));
                if (!guildRole || !guildEntry.generalSettings.autoAssignablesRoles.includes(guildRole.id)) return resolve(await message.channel.send(":x: The specified role does not exist or it is not a self-assignable role"));
                if (message.guild.member(message.author).roles.has(guildRole.id)) return resolve(await message.channel.send(':x: You already have this role'));
                await message.guild.member(message.author).addRole(guildRole.id);
                resolve(await message.channel.send(":white_check_mark: Alright, i gave you the role `" + guildRole.name + "`"));
            }
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
}

exports.conf = {
    disabled: false,
    guildOnly: true,
    permLevel: 1,
    aliases: []
}
exports.help = {
    name: 'iam',
    description: 'Get the list of the self-assignables roles on this server or add one to yourself',
    usage: 'iam',
    category: 'misc',
    detailledUsage: '`{prefix}iam` Will return the list of the self-assignables roles set on this server\n`{prefix}iam Neko` Will give you the self-assignable role `Neko`'
}