exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            await client.createBackup().catch(async(err) => {
                console.dir(err);
                return resolve(await message.channel.send(`:x: An error occurred`));
            });
            resolve(await message.channel.send(`:white_check_mark: Backup created`))
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}
exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false
}

exports.help = {
    name: 'backupcore',
    category: 'admin',
    usage: "backupcore",
    description: 'Create a new backup of the current core-data',
}