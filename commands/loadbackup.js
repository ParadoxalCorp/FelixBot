exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            await client.loadBackup().catch(async(err) => {
                console.dir(err);
                return resolve(await message.channel.send(`:x: An error occurred`));
            });
            resolve(await message.channel.send(`:white_check_mark: Backup loaded`))
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
    name: "loadbackup",
    category: "admin",
    usage: "loadbackup",
    description: "Load the backup of the core-data into the current one",
}