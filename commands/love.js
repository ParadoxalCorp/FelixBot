exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            var userEntry = client.userData.get(message.author.id);
            const users = await client.getUserResolvable(message, {
                guildOnly: true
            });

            function convertToTime(timestamp) {
                return {
                    hours: Math.floor((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((timestamp % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((timestamp % (1000 * 60)) / 1000)
                }
            }

            function getRemainingLps() {
                let remainingLps = 0;
                userEntry.generalSettings.perks.love.forEach(function(lp) {
                    if (lp.cooldown < Date.now()) remainingLps++;
                });
                return remainingLps;
            }

            function getNearestCooldown() {
                let sortByCooldown = userEntry.generalSettings.perks.love.sort(function(a, b) {
                    return a.cooldown - b.cooldown;
                });
                return sortByCooldown[0].cooldown;
            }
            //------------------------------------------------------Check for upvote------------------------------------------
            if (client.upvotes.users.includes(message.author.id) && userEntry.generalSettings.perks.love.filter(l => l.name === "upvote").length === 0) {
                userEntry.generalSettings.perks.love.push({
                    name: "upvote",
                    cooldown: 0
                });
                client.userData.set(message.author.id, userEntry);
            }
            if (!users.size) { //--------------------------------------------Get remaining lps/time til refill------------------------------------
                let remainingLps = getRemainingLps();
                if (!remainingLps) {
                    let remainingTime = convertToTime(getNearestCooldown() - Date.now());
                    return resolve(await message.channel.send(`:x: You already used all your love points, time remaining: ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`));
                } else return resolve(await message.channel.send(`You have **${remainingLps}** love point(s) available`));
            } else if (users.size > 1 && users.size > getRemainingLps()) {
                return resolve(await message.channel.send(`:x: You do not have enough love points to do that D:, you currently have ${getRemainingLps()} love point(s)`));
            } else if (users.size === 1) { //----------------------------------Love a user------------------------------------------------
                if (users.first().id === message.author.id) return resolve(await message.channel.send(":x: Are you trying to love yourself? At least love me instead if you dont know who to love  (╯°□°）╯︵ ┻━┻"));
                let lpCount = message.content.split(/\s+/gim).filter(a => !isNaN(a) && a !== users.first().id).toString();
                if (lpCount.length === 0) lpCount = 1;
                let remainingLps = getRemainingLps();
                if (!remainingLps) {
                    let remainingTime = convertToTime(getNearestCooldown() - Date.now());
                    return resolve(await message.channel.send(`:x: You already used all your love points, time remaining: ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`));
                }
                if (Math.round(lpCount) > remainingLps) lpCount = remainingLps; //If the count of lps is superior to the remaining, give everything remaining
                let receiverEntry = client.userData.get(users.first().id) || client.defaultUserData(users.first().id); //If the user is not in the db
                receiverEntry.generalSettings.lovePoints = (Number(receiverEntry.generalSettings.lovePoints) + Math.round((lpCount)));
                let cooldownsSet = 0;
                for (let i = 0; i < userEntry.generalSettings.perks.love.length; i++) { //Add the cooldowns
                    if (userEntry.generalSettings.perks.love[i].cooldown < Date.now() && cooldownsSet < Math.round(lpCount)) {
                        userEntry.generalSettings.perks.love[i].cooldown = Date.now() + 43200000;
                        cooldownsSet++;
                    }
                }
                client.userData.set(users.first().id, receiverEntry);
                client.userData.set(message.author.id, userEntry);
                return resolve(await message.channel.send(`You just gave **${Math.round(lpCount)}** love point(s) to **${users.first().tag}** :heart:`));
            } else if (users.size > 1) { //------------------------Love multiple users------------------------------------
                users.forEach(function(usr) {
                    if (usr.id === message.author.id) return users.delete(usr.id); //Remove from the collection the author if in and skip to the next
                    let receiverEntry = client.userData.get(usr.id) || client.defaultUserData(usr.id);
                    receiverEntry.generalSettings.lovePoints++;
                    client.userData.set(usr.id, receiverEntry);
                });
                let cooldownsSet = 0;
                for (let i = 0; i < userEntry.generalSettings.perks.love.length; i++) {
                    if (userEntry.generalSettings.perks.love[i].cooldown < Date.now() && cooldownsSet < users.size) {
                        userEntry.generalSettings.perks.love[i].cooldown = Date.now() + 43200000;
                        cooldownsSet++;
                    }
                }
                client.userData.set(message.author.id, userEntry);
                return resolve(await message.channel.send(`You just gave **1** LP to **${users.map(u => u.tag).join(", ")}** :heart:`));
            }
        } catch (err) {
            client.emit('commandFail', message, err);
        }
    });

}
exports.conf = {
    guildOnly: true,
    aliases: ["luv"],
    disabled: false
};

exports.help = {
    name: 'love',
    description: 'Love someone, bring some love to this world !',
    usage: 'love user resolvable',
    category: 'fun',
    detailedUsage: 'You have by default only one love point that you can use every 12 hours, you get an extra love point if you upvoted Felix on Discord bot list\n`{prefix}love 2 user resolvable` Will gives two LPs to the specified user\n`{prefix}love user1 user2` Will give 1 LP to each users specified'
};