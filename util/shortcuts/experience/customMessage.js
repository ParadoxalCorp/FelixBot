module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            args.shift();
            guildEntry.generalSettings.levelSystem.customNotif = args.join(" ");
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Alright this has been set as the message that will be used when a user level up`));
        } catch (err) {
            reject(err);
        }
    });
}