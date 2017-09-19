exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/gim);
            args.shift();
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.generalSettings.autoAssignablesRoles = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.get(r)); //Filter deleted roles
            if (args.length < 1) {
                if (guildEntry.generalSettings.autoAssignablesRoles.length < 1) return resolve(await message.channel.send(":x: There is no self-assignable role set on this server"));
                let roleList = [];
                guildEntry.generalSettings.autoAssignablesRoles.forEach(function(r) {
                    roleList.push(message.guild.roles.get(r).name);
                });
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
                if (!guildRole || !guildEntry.generalSettings.autoAssignablesRoles.includes(guildRole.id) || !message.guild.member(message.author).roles.has(guildRole.id)) return resolve(await message.channel.send(":x: The specified role does not exist, is not a self-assignable role or you don't possess it"));
                await message.guild.member(message.author).removeRole(guildRole.id);
                resolve(await message.channel.send(":white_check_mark: Alright, i removed from you the role `" + guildRole.name + "`"));
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
    name: 'iamnot',
    description: 'Get the list of the self-assignables roles on this server or remove one from yourself',
    usage: 'iamnot',
    category: 'misc',
    detailledUsage: '`{prefix}iam` Will return the list of the self-assignables roles set on this server\n`{prefix}iam Neko` Will remove from you the self-assignable role `Neko`'
}