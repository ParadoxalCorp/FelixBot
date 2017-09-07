exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        var args = message.content.split(/\s+/gim);
        args.shift();
        if (args.length === 0) {
            return resolve(await message.channel.send(":x: I need a user resolvable in order to do that"));
        }
        const users = await client.getUserResolvable(message);
        if (users.size > 0) {
            let whiteListed = [],
                blackListed = [];
            users.forEach(function(user) {
                let userEntry = client.userData.get(user.id);
                if (!userEntry) {
                    userEntry = client.defaultUserData(user.id);
                }
                if (userEntry.generalSettings.blackListed) {
                    userEntry.generalSettings.blackListed = false;
                    whiteListed.push(user);
                } else {
                    userEntry.generalSettings.blackListed = true;
                    blackListed.push(user);
                }
                client.userData.set(user.id, userEntry);
            });
            resolve(await message.channel.send(":white_check_mark:\n**Whitelisted users: **" + whiteListed.map(u => u.tag).join(", ") + "\n**Blacklisted users: **" + blackListed.map(u => u.tag).join(", ")));
        } else {
            resolve(await message.channel.send(":x: User(s) not found"));
        }
    });
}
exports.conf = {
    guildOnly: false,
    permLevel: 42,
    aliases: [],
    disabled: false
}
exports.help = {
    name: 'blacklist',
    parameters: 'User resolvable',
    description: 'Blacklist/whitelist a/or multiple users',
    usage: 'blacklist @mention || ID || username',
    category: 'admin',
    detailledUsage: 'If specified user is blacklisted, they will be whitelisted, and if the user is whitelisted, they will be blacklisted'
};