const paginate = require("../../util/modules/paginateResults.js")
const createInteractiveMessage = require("../../util/helpers/createInteractiveMessage.js");

class GetPermission {
    constructor() {
        this.help = {
            name: 'getpermission',
            description: 'Get all the permissions set',
            usage: 'getpermission',
            detailedUsage: '`{prefix}getpermissions` Will return the permissions set for the whole server\n`{prefix}getpermissions -user [user_resolvable(s)]` Will return the permissions set for the specified user(s)\n`{prefix}getpermissions -channel [channel_resolvable(s)]` Will return the permissions set for the specified channel(s)\n`{prefix}getpermissions -role [role_resolvable(s)]` Will return the permissions set for the specified role(s)\n\nmore info here: <https://github.com/ParadoxalCorp/FelixBot/wiki/Moderation>'
        }
        this.conf = {
            guildOnly: true,
            aliases: ["getperm", "gp"]
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                let targets;
                if (args.find(a => a.search(/\-user|\-u/gim) !== -1)) targets = await message.getUserResolvable();
                if (args.find(a => a.search(/\-role|\-r/gim) !== -1)) targets = await message.getRoleResolvable();
                if (args.find(a => a.search(/\-channel|\-c/gim) !== -1)) targets = await message.getChannelResolvable();
                if (targets && targets.size < 1) return resolve(await message.channel.createMessage(`:x: I couldn't find anything or you didn't specified anything to get the permissions from`));
                //Output global permissions
                if (!targets) {
                    if (!guildEntry.permissions.global.allowedCommands.length && guildEntry.permissions.global.restrictedCommands.length) return resolve(await message.channel.createMessage(`:x: There's no permissions set for the whole server`));
                    let perms = guildEntry.permissions.global.allowedCommands.map(ac => `${ac} | Allowed`).concat(guildEntry.permissions.global.restrictedCommands.map(rc => `${rc} | Restricted`));
                    let paginatedPerms = paginate(perms)
                    resolve(await createInteractiveMessage(message, {
                        title: ':gear: Global permissions list',
                        description: `Here's the list of permissions set for the whole server`,
                        content: paginatedPerms
                    }));
                }
                //Output channels permissions
                else if (targets.first().type) {
                    if (targets.filter(t => guildEntry.permissions.channels.find(c => c.id === t.id)).size === 0) return resolve(await message.channel.createMessage(`:x: There's no permissions set for the channel(s) **${targets.map(t => '#' + t.name).join(", ")}**`));
                    let perms = [];
                    targets.filter(t => guildEntry.permissions.channels.find(c => c.id === t.id)).forEach(t => { perms = perms.concat(guildEntry.permissions.channels.find(c => c.id === t.id).allowedCommands.map(ac => `${ac} | Allowed | #${t.name}`).concat(guildEntry.permissions.channels.find(c => c.id === t.id).restrictedCommands.map(rc => `${rc} | Restricted | #${t.name}`))) });
                    let paginatedPerms = paginate(perms);
                    resolve(await createInteractiveMessage(message, {
                        title: ':gear: Channels permissions list',
                        description: `Here's the list of permissions set for the specified channel(s)`,
                        content: paginatedPerms
                    }));
                }
                //Output roles permissions
                else if (targets.first().hoist) {
                    if (targets.filter(t => guildEntry.permissions.roles.find(r => r.id === t.id)).size === 0) return resolve(await message.channel.createMessage(`:x: There's no permissions set for the role(s) **${targets.map(t => t.name).join(', ')}**`));
                    let perms = [];
                    targets.filter(t => guildEntry.permissions.roles.find(r => r.id === t.id)).forEach(t => { perms = perms.concat(guildEntry.permissions.roles.find(r => r.id === t.id).allowedCommands.map(ac => `${ac} | Allowed | ${t.name}`).concat(guildEntry.permissions.roles.find(r => r.id === t.id).restrictedCommands.map(rc => `${rc} | Restricted | ${t.name}`))) });
                    let paginatedPerms = paginate(perms);
                    resolve(await createInteractiveMessage(message, {
                        title: ':gear: Roles permissions list',
                        description: `Here's the list of permissions set for the specified role(s)`,
                        content: paginatedPerms
                    }));
                }
                //Output users permissions
                else if (targets.first().username) {
                    if (targets.filter(t => guildEntry.permissions.users.find(u => u.id === t.id)).size === 0) return resolve(await message.channel.createMessage(`:x: There's no permissions set for the user(s) **${targets.map(t => t.tag).join(', ')}**`));
                    let perms = [];
                    targets.filter(t => guildEntry.permissions.users.find(u => u.id === t.id)).forEach(t => { perms = perms.concat(guildEntry.permissions.users.find(u => u.id === t.id).allowedCommands.map(ac => `${ac} | Allowed | ${t.tag}`).concat(guildEntry.permissions.users.find(u => u.id === t.id).restrictedCommands.map(rc => `${rc} | Restricted | ${t.tag}`))) });
                    let paginatedPerms = paginate(perms);
                    resolve(await createInteractiveMessage(message, {
                        title: ':gear: Users permissions list',
                        description: `Here's the list of permissions set for the specified user(s)`,
                        content: paginatedPerms
                    }));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new GetPermission();