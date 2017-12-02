module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            client.emit('guildMemberAdd', message.guild, message.guild.members.get(message.author.id));
        } catch (err) {
            reject(err);
        }
    });
}