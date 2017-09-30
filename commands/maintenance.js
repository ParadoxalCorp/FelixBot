exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        if (client.maintenance) {
            await client.user.setStatus('online');
            client.maintenance = false;
            resolve(await message.channel.send(":white_check_mark: Maintenance status has been set to **off**"));
        } else {
            await client.user.setStatus('dnd');
            client.maintenance = true;
            resolve(await message.channel.send(":white_check_mark: Maintenance status has been set to **on**"));
        }
    });
}
exports.conf = {
    guildOnly: false,
    disabled: false,
    aliases: []
}
exports.help = {
    name: 'maintenance',
    description: 'Either enable or disable Felix\'s maintenance status, if on, Felix will ignore all users',
    usage: 'maintenance',
    category: 'admin'
};