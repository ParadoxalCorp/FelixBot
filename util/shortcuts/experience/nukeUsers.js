module.exports = async(client, message, args) => {
    /**
     * Shortcut to nuke everything
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            let confirmation = await message.awaitReply({
                message: "Are you sure you want to do that? This will nuke the experience(and messages counter) for all users, type `yes` to confirm or anything else to abort"
            });
            if (!confirmation.reply || confirmation.reply.content !== "yes") return resolve(message.channel.createMessage(`:x: Aborted`).then(m => {
                setTimeout(() => {
                    m.delete();
                }, 5000)
            }));
            guildEntry.levelSystem.users = [];
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Successfully nuked users activity stats`));
        } catch (err) {
            reject(err);
        }
    });
}