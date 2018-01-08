module.exports = async(client, message, args) => {
        /**
         * Shortcut to add a role to the experience system
         * @param {Client} client The bot instance
         * @param {Object} message The message which triggered this shortcut
         * @param {Array} args The splitted arguments
         */

        return new Promise(async(resolve, reject) => {
                    try {
                        const guildEntry = client.guildData.get(message.guild.id);
                        let params = message.content.split(/\|/gim);
                        let role = await message.getRoleResolvable({ max: 1 });
                        let counter = params[1];
                        let count = parseInt(params[2]);
                        if (!new RegExp(/message|experience/gim).test(params[1])) return resolve(await message.channel.createMessage(`:x: Invalid parameter, must be either \`message\` or \`experience\``));
                        if (!role.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the specified role`));
                        if (isNaN(count)) return resolve(await message.channel.createMessage(`:x: Invalid exp/messages count`));
                        if (guildEntry.levelSystem.roles.find(r => r.id === role.first().id)) return resolve(await message.channel.createMessage(`:x: The role \`${role.first().name}\` is already set to be given at some point`));
                        if (guildEntry.levelSystem.roles.filter(r => r.method === counter.trim() && r.at === count).length === 3) return resolve(await message.channel.createMessage(`:x: I can't give more than 3 roles at the same point`));
                        guildEntry.levelSystem.roles.push({
                            id: role.first().id,
                            at: count,
                            method: counter.trim()
                        });
                        client.guildData.set(message.guild.id, guildEntry);
                        resolve(await message.channel.createMessage(`:white_check_mark: The role \`${role.first().name}\` has successfully been set to be given at ${counter.trim() === "message" ? ("`" + count + "` messages") : ("the level `" + count + "`")}`));
        } catch (err) {
            reject(err);
        }
    });
}