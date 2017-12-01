module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            const role = await message.getRoleResolvable();
            if (!role.first()) return resolve(message.channel.createMessage(`:x: I couldn't find the specified role`));
            guildEntry.onEvent.guildMemberAdd.onJoinRole = guildEntry.onEvent.guildMemberAdd.onJoinRole.filter(r => message.guild.roles.has(r));
            if (guildEntry.onEvent.guildMemberAdd.onJoinRole.find(r => r === role.first().id)) return resolve(message.channel.createMessage(`:x: This role is already set to be given to new members`));
            if (guildEntry.onEvent.guildMemberAdd.onJoinRole.length === 4) return resolve(message.channel.createMessage(`:x: There can't be more than 4 roles given to new members at the same time !`));
            guildEntry.onEvent.guildMemberAdd.onJoinRole.push(role.first().id);
            client.guildData.set(message.guild.id, guildEntry);
            resolve(message.channel.createMessage(`:white_check_mark: The role \`${role.first().name}\` has successfully been set to be given to new members`));
        } catch (err) {
            reject(err);
        }
    });
}