module.exports = async(client, message, args) => {
    /**
     * Shortcut to remove a role from the experience system
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            const role = await message.getRoleResolvable({ max: 1 });
            if (!role.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the specified role`));
            if (!guildEntry.generalSettings.levelSystem.roles.find(r => r.id === role.first().id)) return resolve(await message.channel.createMessage(`:x: That role isn't set to be given at any point`));
            guildEntry.generalSettings.levelSystem.roles.splice(guildEntry.generalSettings.levelSystem.roles.findIndex(r => r.id === role.first().id), 1);
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: The role \`${role.first().name}\` has successfully been removed`));
        } catch (err) {
            reject(err);
        }
    });
}