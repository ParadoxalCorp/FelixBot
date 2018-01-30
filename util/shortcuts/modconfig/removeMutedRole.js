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
            if (!guildEntry.moderation.mutedRoles.find(r => r.id === role.first().id)) {
                return resolve(await message.channel.createMessage(`:x: This role is not set as a custom muted role`));
            }
            guildEntry.moderation.mutedRoles.splice(guildEntry.moderation.mutedRoles.find(r => r.id === role.first().id), 1);
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Successfully removed the role \`${role.first().name}\` from the custom muted roles`));
        } catch (err) {
            reject(err);
        }
    });
}