module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            const role = await message.getRoleResolvable();
            if (!role.first()) return resolve(message.channel.createMessage(`:x: I couldn't find the specified role`));
            guildEntry.onEvent.guildMemberAdd.onJoinRole = guildEntry.onEvent.guildMemberAdd.onJoinRole.filter(r => message.guild.roles.has(r));
            if (!guildEntry.onEvent.guildMemberAdd.onJoinRole.find(r => r === role.first().id)) return resolve(message.channel.createMessage(`:x: This role isn't set to be given to new members`));
            guildEntry.onEvent.guildMemberAdd.onJoinRole.splice(guildEntry.onEvent.guildMemberAdd.onJoinRole.findIndex(r => r === role.first().id), 1);
            client.guildData.set(message.guild.id, guildEntry);
            resolve(message.channel.createMessage(`:white_check_mark: The role \`${role.first().name}\` has successfully been removed from the list of roles to give to new members`));
        } catch (err) {
            reject(err);
        }
    });
}