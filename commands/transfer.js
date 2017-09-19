exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            //Get the needed arguments
            const userEntry = client.userData.get(message.author.id);
            let args = message.content.split(/\s+/);
            args.shift();
            let users = await client.getUserResolvable(message, {
                guildOnly: true
            });
            //Return current points if no args
            if (!args[0]) return resolve(await message.channel.send(`You currently have **${userEntry.generalSettings.points}** points`));
            //Else continue the transfer process
            if (!users.first()) return resolve(await message.channel.send(`:x: You did not specified any user or i couldn't find them :v`));
            let amount = args.filter(a => !isNaN(a) && a !== users.first().id); //Get the amount and make id resolvable work
            if (!amount[0]) return resolve(await message.channel.send(':x: You did not specified the amount of points that i should transfer to him'));
            else if (Math.round(amount[0]) > userEntry.generalSettings.points) return resolve(await message.channel.send(`:x: Sorry but you dont have enough points to do that, you currently have **${userEntry.generalSettings.points}** points`));
            let mentionnedEntry = client.userData.get(users.first().id) || client.defaultUserData(users.first().id);
            //Transfer the points
            mentionnedEntry.generalSettings.points = (Math.round(Number(amount[0])) + Number(mentionnedEntry.generalSettings.points));
            userEntry.generalSettings.points = (Number(userEntry.generalSettings.points) - Math.round(Number(amount[0])));
            //Save the transfer
            client.userData.set(message.author.id, userEntry);
            client.userData.set(users.first().id, mentionnedEntry);
            resolve(await message.channel.send(`:white_check_mark: You transferred **${Math.round(amount[0])}** of your points to **${users.first().tag}**`));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}

exports.conf = {
    guildOnly: true,
    aliases: ["give"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'transfer',
    description: 'Transfer some of your points to the specified user, using the command without argument will return how many points you currently have',
    usage: 'transfer 500 [user resolvable]',
    category: 'fun'
};