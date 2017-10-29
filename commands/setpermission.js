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
            if (args.find(a => a.search(/\-user|-u/gim) !== -1)) targets = await message.getUserResolvable();
            else if (args.find(a => a.search(/\-channel|-c/gim) !== -1)) targets = await message.getChannelResolvable();
            else if (args.find(a => a.search(/\-role|-r/gim) !== -1)) targets = await message.getRoleResolvable();
            //Handle missing args
            if (!permission[0]) return resolve(await message.channel.send(`:x: You did not specified a permission to set`));
            if (targets !== 'global' && targets.size < 1) return resolve(await message.channel.send(`:x: You did not specified a target`));
            if (!action[0]) return resolve(await message.channel.send(`:x: You did not specified whether i should enable or restrict \`${permission[0]}\``));
            //Set global permissions
            if (targets === 'global') {
                if (action[0] === 'true') {
                    //If already set to this, return
                    if (guildEntry.permissions.global.allowedCommands.includes(permission[0])) return resolve(await message.channel.send(`:x: \`${permission[0]}\` is already set to \`true\``));
                    //If was restricted, remove it from the restricted commands
                    if (guildEntry.permissions.global.restrictedCommands.includes(permission[0])) guildEntry.permissions.global.restrictedCommands.splice(guildEntry.permissions.global.restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                    //Finally push to allowed commands
                    guildEntry.permissions.global.allowedCommands.push(permission[0]);
                } else if (action[0] === 'false') {
                    if (guildEntry.permissions.global.restrictedCommands.includes(permission[0])) return resolve(await message.channel.send(`:x: \`${permission[0]}\` is already set to \`false\``));
                    if (guildEntry.permissions.global.allowedCommands.includes(permission[0])) guildEntry.permissions.global.allowedCommands.splice(guildEntry.permissions.global.allowedCommands.findIndex(ac => ac === permission[0]), 1);
                    guildEntry.permissions.global.restrictedCommands.push(permission[0]);
                }
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, \`${permission[0]}\` has been set to \`${action[0]}\``));
            }
            //Set users permissions
            else if (targets.first().username) { //(If the collection contains user objects)
                targets.forEach(m => {
                    if (!guildEntry.permissions.users.find(u => u.id === m.id)) guildEntry.permissions.users.push({
                        id: m.id,
                        allowedCommands: [],
                        restrictedCommands: []
                    });
                    let userPos = guildEntry.permissions.users.findIndex(u => u.id === m.id);
                    if (action[0] === 'true') {
                        if (guildEntry.permissions.users[userPos].allowedCommands.includes(permission[0])) return;
                        if (guildEntry.permissions.users[userPos].restrictedCommands.includes(permission[0])) guildEntry.permissions.users[userPos].restrictedCommands.splice(guildEntry.permissions.users[userPos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        guildEntry.permissions.users[userPos].allowedCommands.push(permission[0]);
                    } else if (action[0] === 'false') {
                        if (guildEntry.permissions.users[userPos].restrictedCommands.includes(permission[0])) return;
                        if (guildEntry.permissions.users[userPos].allowedCommands.includes(permission[0])) guildEntry.permissions.users[userPos].allowedCommands.splice(guildEntry.permissions.users[userPos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        guildEntry.permissions.users[userPos].restrictedCommands.push(permission[0]);
                    }
                });
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, \`${permission[0]}\` has been set to \`${action[0]}\` for the user(s) **${targets.map(u => u.tag).join(', ')}**`));
            }
            //Set channels permissions
            else if (targets.first().type) { //(If the collection contains channels objects)
                targets.forEach(gc => {
                    if (!guildEntry.permissions.channels.find(c => c.id === gc.id)) guildEntry.permissions.channels.push({
                        id: gc.id,
                        allowedCommands: [],
                        restrictedCommands: []
                    });
                    let channelPos = guildEntry.permissions.channels.findIndex(c => c.id === gc.id);
                    if (action[0] === 'true') {
                        if (guildEntry.permissions.channels[channelPos].allowedCommands.includes(permission[0])) return;
                        if (guildEntry.permissions.channels[channelPos].restrictedCommands.includes(permission[0])) guildEntry.permissions.channels[channelPos].restrictedCommands.splice(guildEntry.permissions.channels[channelPos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        guildEntry.permissions.channels[channelPos].allowedCommands.push(permission[0]);
                    } else if (action[0] === 'false') {
                        if (guildEntry.permissions.channels[channelPos].restrictedCommands.includes(permission[0])) return;
                        if (guildEntry.permissions.channels[channelPos].allowedCommands.includes(permission[0])) guildEntry.permissions.channels[channelPos].allowedCommands.splice(guildEntry.permissions.channels[channelPos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        guildEntry.permissions.channels[channelPos].restrictedCommands.push(permission[0]);
                    }
                });
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.send(`:white_check_mark: Alright, \`${permission[0]}\` has been set to \`${action[0]}\` for the channel(s) **${targets.map(c => c.name).join(', ')}**`));
            }
            //Set roles permissions
            else if (targets.first().hoist) { //(If the collection contains roles objects)
                targets.forEach(gr => {
                    if (!guildEntry.permissions.roles.find(r => r.id === gr.id)) guildEntry.permissions.roles.push({
                        id: gr.id,
                        allowedCommands: [],
                        restrictedCommands: []
                    });
                    let rolePos = guildEntry.permissions.roles.findIndex(r => r.id === gr.id);
                    if (action[0] === 'true') {
                        if (guildEntry.permissions.roles[rolePos].allowedCommands.includes(permission[0])) return;
                        if (guildEntry.permissions.roles[rolePos].restrictedCommands.includes(permission[0])) guildEntry.permissions.roles[rolePos].restrictedCommands.splice(guildEntry.permissions.roles[rolePos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        guildEntry.permissions.roles[rolePos].allowedCommands.push(permission[0]);
                    } else if (action[0] === 'false') {
                        if (guildEntry.permissions.roles[rolePos].restrictedCommands.includes(permission[0])) return;
                        if (guildEntry.permissions.roles[rolePos].allowedCommands.includes(permission[0])) guildEntry.permissions.roles[rolePos].allowedCommands.splice(guildEntry.permissions.roles[rolePos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        guildEntry.permissions.roles[rolePos].restrictedCommands.push(permission[0]);
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
    aliases: ['setperm', 'sp'],
    disabled: false,
};

exports.help = {
    name: 'setpermission',
    description: 'A more advanced way to set the permissions of a role/channel/user, allowing you to allow and restrict specific commands',
    parameters: '`-user`, `-role`, `-channel`',
    usage: 'setpermission [command] [true/false]',
    category: 'moderation',
    detailedUsage: '`{prefix}setpermission ping false` Will disable the ping command for the whole server\n`{prefix}setpermission ping true -role [role_resolvable(s)]` Will enable the ping command for the specified role(s)\n`{prefix}setpermission ping true -user [user_resolvable(s)]` Will enable the ping command for the specified user(s)\n`{prefix}setpermission ping true -channel [channel_resolvable(s)]` Will enable the ping command for the specified channel(s)\n\n**Note:** You can use `[category]*` instead of a command name to enable/disable a whole command category, so for example\n`{prefix}setpermission generic* false` Will disable all the generic commands for the whole server'
};