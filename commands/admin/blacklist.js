class Blacklist {
    constructor() {
        this.help = {
            name: 'blacklist',
            usage: 'blacklist [user_resolvable]',
            description: `Blacklist or whitelist a user if they were blacklisted from Felix, a blacklisted user will be entirely ignored by Felix`
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: You need to specify at least one user to blacklist/whitelist`));
                let users = await message.getUserResolvable({ guildOnly: false });
                if (!users.size) return resolve(await message.channel.createMessage(`:x: Couldn't find the specified user(s)`));
                let whiteListed = [];
                let blackListed = [];
                users.forEach(u => {
                    let userEntry = client.userData.get(u.id);
                    if (!userEntry) return;
                    userEntry.generalSettings.blackListed = userEntry.generalSettings.blackListed ? false : true;
                    userEntry.generalSettings.blackListed ? blackListed.push(u) : whiteListed.push(u);
                    client.userData.set(u.id, userEntry);
                });
                resolve(await message.channel.createMessage(`Whitelisted user(s): ${whiteListed.map(u => u.tag).join(", ")}\nBlacklisted user(s): ${blackListed.map(u => u.tag).join(", ")}`));
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new Blacklist();