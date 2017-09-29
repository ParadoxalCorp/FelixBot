exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            //Get the args
            let args = message.content.split(/\s+/);
            args.shift();
            let targets;
            if (args.find(a => a.toLowerCase() === '-user') || args.find(a => a.toLowerCase() === '-u')) targets = await client.getUserResolvable(message);
            if (args.find(a => a.toLowerCase() === '-role') || args.find(a => a.toLowerCase() === '-r')) targets = await client.getRoleResolvable(message);
            if (args.find(a => a.toLowerCase() === '-channel') || args.find(a => a.toLowerCase() === '-c')) targets = await client.getChannelResolvable(message);
            if (targets && targets.size < 1) return resolve(await message.channel.send(`:x: I couldn't find anything or you didn't specified anything to get the permissions from`));
            //Output global permissions
            if (!targets) {
                if (!guildEntry.permissionsLevels.global.allowedCommands.length && guildEntry.permissionsLevels.global.restrictedCommands.length) return resolve(await message.channel.send(`:x: There's no permissions set for the whole server`));
                let perms = guildEntry.permissionsLevels.global.allowedCommands.map(ac => `${ac} | Allowed`).concat(guildEntry.permissionsLevels.global.restrictedCommands.map(rc => `${rc} | Restricted`));
                let paginatedPerms = await client.pageResults({
                    results: perms
                });
                resolve(await client.createInteractiveMessage(message, {
                    title: ':gear: Global permissions list',
                    description: `Here's the list of permissions set for the whole server`,
                    content: paginatedPerms.results
                }));
            }
            //Output channels permissions
            else if (targets.first().type) {
                if (!targets.filter(t => guildEntry.permissionsLevels.channels.find(c => c.id === t.id)).size) return resolve(await message.channel.send(`:x: There's no permissions set for the channel(s) **${targets.map(t => '#' + t.name).join(", ")}**`));
                let perms = [];
                targets.filter(t => guildEntry.permissionsLevels.channels.find(c => c.id === t.id)).forEach(t => { perms = perms.concat(guildEntry.permissionsLevels.channels.find(c => c.id === t.id).allowedCommands.map(ac => `${ac} | Allowed | #${t.name}`).concat(guildEntry.permissionsLevels.channels.find(c => c.id === t.id).restrictedCommands.map(rc => `${rc} | Restricted | #${t.name}`))) });
                let paginatedPerms = await client.pageResults({
                    results: perms
                });
                console.log(perms);
                resolve(await client.createInteractiveMessage(message, {
                    title: ':gear: Channels permissions list',
                    description: `Here's the list of permissions set for the specified channel(s)`,
                    content: paginatedPerms.results
                }));
            }
            //Output roles permissions
            else if (targets.first().hoist) {
                if (!targets.filter(t => guildEntry.permissionsLevels.roles.find(r => r.id === t.id)).size) return resolve(await message.channel.send(`:x: There's no permissions set for the role(s) **${targets.map(t => t.name).join(', ')}**`));
                let perms = [];
                targets.filter(t => guildEntry.permissionsLevels.roles.find(r => r.id === t.id)).forEach(t => { perms = perms.concat(guildEntry.permissionsLevels.roles.find(r => r.id === t.id).allowedCommands.map(ac => `${ac} | Allowed | ${t.name}`).concat(guildEntry.permissionsLevels.roles.find(r => r.id === t.id).restrictedCommands.map(rc => `${rc} | Restricted | ${t.name}`))) });
                let paginatedPerms = await client.pageResults({
                    results: perms
                });
                resolve(await client.createInteractiveMessage(message, {
                    title: ':gear: Roles permissions list',
                    description: `Here's the list of permissions set for the specified role(s)`,
                    content: paginatedPerms.results
                }));
            }
            //Output users permissions
            else if (targets.first().username) {
                if (!targets.filter(t => guildEntry.permissionsLevels.users.find(u => u.id === t.id)).size) return resolve(await message.channel.send(`:x: There's no permissions set for the user(s) **${targets.map(t => t.tag).join(', ')}**`));
                let perms = [];
                targets.filter(t => guildEntry.permissionsLevels.users.find(u => u.id === t.id)).forEach(t => { perms = perms.concat(guildEntry.permissionsLevels.users.find(u => u.id === t.id).allowedCommands.map(ac => `${ac} | Allowed | ${t.tag}`).concat(guildEntry.permissionsLevels.users.find(u => u.id === t.id).restrictedCommands.map(rc => `${rc} | Restricted | ${t.tag}`))) });
                let paginatedPerms = await client.pageResults({
                    results: perms
                });
                resolve(await client.createInteractiveMessage(message, {
                    title: ':gear: Users permissions list',
                    description: `Here's the list of permissions set for the specified user(s)`,
                    content: paginatedPerms.results
                }));
            }
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}

exports.conf = {
    guildOnly: true,
    aliases: ["getperms", "gp"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'getpermissions',
    description: 'Get all the permissions set',
    parameters: '`-user`, `-role`, `-channel`',
    usage: 'getpermissions',
    category: 'moderation',
    detailedUsage: '`{prefix}getpermissions` Will return the permissions set for the whole server\n`{prefix}getpermissions -user [user_resolvable(s)]` Will return the permissions set for the specified user(s)\n`{prefix}getpermissions -channel [channel_resolvable(s)]` Will return the permissions set for the specified channel(s)\n`{prefix}getpermissions -role [role_resolvable(s)]` Will return the permissions set for the specified role(s)'
};