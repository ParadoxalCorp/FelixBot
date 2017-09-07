exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const users = await client.getUserResolvable(message, {
                guildOnly: true
            });
            let target = message.author;
            if (users.size > 0) target = users.first();
            const userEntry = client.userData.get(target.id) || client.defaultUserData(target.id);
            const guildEntry = client.guildData.get(message.guild.id);
            if (!target.id !== message.author.id && !userEntry.dataPrivacy.publicProfile) return resolve(await message.channel.send(":x: Sorry but the profile of this user is private :v"));
            let embedFields = [];
            if (message.guild.member(target).nickname) {
                embedFields.push({
                    name: ":busts_in_silhouette: Nickname",
                    value: message.guild.member(target).nickname,
                    inline: true
                });
            }
            if (userEntry.experience.expCount && userEntry.dataPrivacy.publicLevel) {
                const levelDetails = client.getLevelDetails(userEntry.experience.level, userEntry.experience.expCount);
                embedFields.push({
                    name: ":star: Global experience",
                    value: "Level " + userEntry.experience.level + "\nExp: " + Math.round(userEntry.experience.expCount) + `\nLevel progress: ${(levelDetails.levelProgress)}`,
                    inline: true
                });
            }
            if (guildEntry.generalSettings.levelSystem.enabled && guildEntry.generalSettings.levelSystem.users.filter(u => u.id === target.id).length !== 0) {
                const userPos = guildEntry.generalSettings.levelSystem.users.findIndex(function(element) {
                    return element.id === target.id;
                });
                const levelDetails = client.getLevelDetails(guildEntry.generalSettings.levelSystem.users[userPos].level, guildEntry.generalSettings.levelSystem.users[userPos].expCount);
                embedFields.push({
                    name: ":star: Local experience",
                    value: "Level " + guildEntry.generalSettings.levelSystem.users[userPos].level + "\nExp: " + Math.round(guildEntry.generalSettings.levelSystem.users[userPos].expCount) + `\nLevel progress: ${(levelDetails.levelProgress)}`,
                    inline: true
                });
            }
            if (message.guild.member(target).hoistRole) {
                embedFields.push({
                    name: ":mag: Hoist role",
                    value: message.guild.member(target).hoistRole.name,
                    inline: true
                });
            }
            if (message.guild.member(target).highestRole) {
                embedFields.push({
                    name: ":arrow_up_small: Highest Role",
                    value: message.guild.member(target).highestRole.name,
                    inline: true
                });
            }
            if (message.guild.member(target).displayHexColor) {
                embedFields.push({
                    name: ":large_blue_diamond: HEX color",
                    value: message.guild.member(target).displayHexColor,
                    inline: true
                });
            }
            if (userEntry.dataPrivacy.publicPoints) {
                embedFields.push({
                    name: ":ribbon: Points",
                    value: userEntry.generalSettings.points,
                    inline: true
                });
            }
            if (userEntry.dataPrivacy.publicLove) {
                embedFields.push({
                    name: ":heart: Love points",
                    value: userEntry.generalSettings.lovePoints,
                    inline: true
                });
            }
            resolve(await message.channel.send({
                embed: {
                    title: ':bust_in_silhouette: User info',
                    fields: embedFields,
                    timestamp: new Date(),
                    image: {
                        url: target.avatarURL
                    }
                }
            }));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
}
exports.conf = {
    disabled: false,
    aliases: ["profile"],
    permLevel: 1,
    guildOnly: true
}
exports.help = {
    name: 'uinfo',
    description: 'Display some infos about a user or yourself',
    usage: 'uinfo user resolvable',
    category: 'generic'
}