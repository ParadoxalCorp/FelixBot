const DefaultStructures = require('../../helpers/defaultStructures');

module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            args.shift();
            const role = await message.getRoleResolvable({
                max: 1,
                text: args.join(' ')
            });
            if (!role.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the specified role`));
            guildEntry.moderation.mutedRoles = guildEntry.moderation.mutedRoles.filter(r => message.guild.roles.has(r.id));
            if (guildEntry.moderation.mutedRoles.find(r => r.id === role.first().id)) {
                return resolve(await message.channel.createMessage(`:x: This role is already set as a custom muted role`));
            }
            let name = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: Custom muted role name',
                        description: 'Choose a name for this mute, the name will be used in the cases logged in the mod-log and also to differentiate between other mutes.\nReply with `none` to don\'t set any, in this case the role name will be used instead.\nNote: You can use `%ROLE%`, it will be replaced by the role name when displayed',
                        footer: {
                            text: 'Time limit: 60 seconds'
                        }
                    }
                }
            }).then(r => r.reply ? (r.reply.content === "none" ? false : r.reply.content) : false);
            guildEntry.moderation.mutedRoles.push(DefaultStructures.customMutedRole(role.first().id, name));
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Successfully added the role \`${role.first().name}\` as a custom muted role`));
        } catch (err) {
            reject(err);
        }
    });
}