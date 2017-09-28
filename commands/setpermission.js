exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            //Get the args
            let args = message.content.split(/\s+/);
            args.shift();
            let permission = args.filter(c => client.commands.find(cmd => cmd.help.name === c.toLowerCase() && cmd.help.category !== 'admin') || client.commands.find(cmd => cmd.help.category !== 'admin' && cmd.help.category === c.substr(0, c.indexOf('*'))));
            let action = args.filter(c => c.toLowerCase() === 'true' || c.toLowerCase() === 'false');
            let targets = 'global';
            if (args.map(a => a.toLowerCase()).includes('-user') || args.map(a => a.toLowerCase()).includes('-u')) targets = await client.getUserResolvable(message, {
                guildOnly: true
            });
            else if (args.map(a => a.toLowerCase()).includes('-channel') || args.map(a => a.toLowerCase()).includes('-c')) targets = await client.getChannelResolvable(message);
            else if (args.map(a => a.toLowerCase()).includes('-role') || args.map(a => a.toLowerCase()).includes('-r')) targets = await client.getRoleResolvable(message);
            //Handle missing args
            if (!permission[0]) return resolve(await message.channel.send(`:x: You did not specified a permission to set`));
            if (targets !== 'global' && targets.size < 1) return resolve(await message.channel.send(`:x: You did not specified a target`));
            if (!action[0]) return resolve(await message.channel.send(`:x: You did not specified whether i should enable or restrict \`${permission[0]}\``));
            //Set global permissions
            if (targets === 'global') {
                if (action[0] === 'true') {
                    //If already set to this, return
                    if (guildEntry.permissionsLevels.global.allowedCommands.includes(permission[0])) return resolve(await message.channel.send(`:x: \`${permission[0]}\` is already set to \`true\``));
                    //If was restricted, remove it from the restricted commands
                    if (guildEntry.permissionsLevels.global.restrictedCommands.includes(permission[0])) guildEntry.permissionsLevels.global.restrictedCommands.splice(guildEntry.permissionsLevels.global.restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                    //Finally push to allowed commands
                    guildEntry.permissionsLevels.global.allowedCommands.push(permission[0]);
                } else if (action[0] === 'false') {
                    if (guildEntry.permissionsLevels.global.restrictedCommands.includes(permission[0])) return resolve(await message.channel.send(`:x: \`${permission[0]}\` is already set to \`false\``));
                    if (guildEntry.permissionsLevels.global.allowedCommands.includes(permission[0])) guildEntry.permissionsLevels.global.allowedCommands.splice(guildEntry.permissionsLevels.global.allowedCommands.findIndex(ac => ac === permission[0]), 1);
                    guildEntry.permissionsLevels.global.restrictedCommands.push(permission[0]);
                }
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, \`${permission[0]}\` has been set to \`${action[0]}\``));
            }
            //Set users permissions
            else if (targets.first().username) { //(If the collection contains user objects)
                targets.forEach(m => {
                    if (!guildEntry.permissionsLevels.users.find(u => u.id === m.id)) guildEntry.permissionsLevels.users.push({
                        id: m.id,
                        allowedCommands: [],
                        restrictedCommands: []
                    });
                    let userPos = guildEntry.permissionsLevels.users.findIndex(u => u.id === m.id);
                    if (action[0] === 'true') {
                        if (guildEntry.permissionsLevels.users[userPos].allowedCommands.includes(permission[0])) return;
                        if (guildEntry.permissionsLevels.users[userPos].restrictedCommands.includes(permission[0])) guildEntry.permissionsLevels.users[userPos].restrictedCommands.splice(guildEntry.permissionsLevels.users[userPos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        guildEntry.permissionsLevels.users[userPos].allowedCommands.push(permission[0]);
                    } else if (action[0] === 'false') {
                        if (guildEntry.permissionsLevels.users[userPos].restrictedCommands.includes(permission[0])) return;
                        if (guildEntry.permissionsLevels.users[userPos].allowedCommands.includes(permission[0])) guildEntry.permissionsLevels.users[userPos].allowedCommands.splice(guildEntry.permissionsLevels.users[userPos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        guildEntry.permissionsLevels.users[userPos].restrictedCommands.push(permission[0]);
                    }
                });
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, \`${permission[0]}\` has been set to \`${action[0]}\` for the user(s) **${targets.map(u => u.tag).join(', ')}**`));
            }
            //Set channels permissions
            else if (targets.first().type) { //(If the collection contains channels objects)
                targets.forEach(gc => {
                    if (!guildEntry.permissionsLevels.channels.find(c => c.id === gc.id)) guildEntry.permissionsLevels.channels.push({
                        id: gc.id,
                        allowedCommands: [],
                        restrictedCommands: []
                    });
                    let channelPos = guildEntry.permissionsLevels.channels.findIndex(c => c.id === gc.id);
                    if (action[0] === 'true') {
                        if (guildEntry.permissionsLevels.channels[channelPos].allowedCommands.includes(permission[0])) return;
                        if (guildEntry.permissionsLevels.channels[channelPos].restrictedCommands.includes(permission[0])) guildEntry.permissionsLevels.channels[channelPos].restrictedCommands.splice(guildEntry.permissionsLevels.channels[channelPos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        guildEntry.permissionsLevels.channels[channelPos].allowedCommands.push(permission[0]);
                    } else if (action[0] === 'false') {
                        if (guildEntry.permissionsLevels.channels[channelPos].restrictedCommands.includes(permission[0])) return;
                        if (guildEntry.permissionsLevels.channels[channelPos].allowedCommands.includes(permission[0])) guildEntry.permissionsLevels.channels[channelPos].allowedCommands.splice(guildEntry.permissionsLevels.channels[channelPos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        guildEntry.permissionsLevels.channels[channelPos].restrictedCommands.push(permission[0]);
                    }
                });
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, \`${permission[0]}\` has been set to \`${action[0]}\` for the channel(s) **${targets.map(c => c.name).join(', ')}**`));
            }
            //Set roles permissions
            else if (targets.first().hoist) { //(If the collection contains roles objects)
                targets.forEach(gr => {
                    if (!guildEntry.permissionsLevels.roles.find(r => r.id === gr.id)) guildEntry.permissionsLevels.roles.push({
                        id: gr.id,
                        allowedCommands: [],
                        restrictedCommands: []
                    });
                    let rolePos = guildEntry.permissionsLevels.roles.findIndex(r => r.id === gr.id);
                    if (action[0] === 'true') {
                        if (guildEntry.permissionsLevels.roles[rolePos].allowedCommands.includes(permission[0])) return;
                        if (guildEntry.permissionsLevels.roles[rolePos].restrictedCommands.includes(permission[0])) guildEntry.permissionsLevels.roles[rolePos].restrictedCommands.splice(guildEntry.permissionsLevels.roles[rolePos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        guildEntry.permissionsLevels.roles[rolePos].allowedCommands.push(permission[0]);
                    } else if (action[0] === 'false') {
                        if (guildEntry.permissionsLevels.roles[rolePos].restrictedCommands.includes(permission[0])) return;
                        if (guildEntry.permissionsLevels.roles[rolePos].allowedCommands.includes(permission[0])) guildEntry.permissionsLevels.roles[rolePos].allowedCommands.splice(guildEntry.permissionsLevels.roles[rolePos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        guildEntry.permissionsLevels.roles[rolePos].restrictedCommands.push(permission[0]);
                    }
                });
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, \`${permission[0]}\` has been set to \`${action[0]}\` for the role(s) **${targets.map(c => c.name).join(', ')}**`));
            }
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: ['permission'],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'setpermission',
    description: 'A more advanced way to set the permissions of a role/channel/user, allowing you to allow and restrict specific commands',
    usage: 'setpermission',
    category: 'moderation'
};