const getLevelDetails = require('../../util/helpers/getLevelDetails')
const moment = require("moment");
const TimeConverter = require(`../../util/modules/timeConverter.js`);

class Uinfo {
    constructor() {
        this.help = {
            name: 'uinfo',
            description: 'Display some infos about a user or yourself',
            usage: 'uinfo user resolvable'
        }
        this.conf = {
            guildOnly: true,
            aliases: ["profile"]
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const users = await message.getUserResolvable();
                let target = users.size > 0 ? users.first() : message.author;
                const userEntry = client.userData.get(target.id) || client.defaultUserData(target.id);
                const guildEntry = client.guildData.get(message.guild.id);
                if (target.id !== message.author.id && !userEntry.dataPrivacy.publicProfile) return resolve(await message.channel.createMessage(":x: Sorry but the profile of this user is private :v"));
                let embedFields = [];
                //Awesome code from Rem to make gifs great again
                let avatar = target.avatar ? (target.avatar.startsWith('a_') ? `​https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.gif` : `​https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.webp`) : target.defaultAvatarURL;
                avatar = avatar.replace(/[^a-zA-Z0-9_\-./:]/, '');
                avatar += '?size=1024';
                if (target.avatar && target.avatar.startsWith('a_')) {
                    avatar += '&f=.gif';
                }
                //----------------------------------------------------------------------------------
                if (message.guild.members.get(target.id).nickname) {
                    embedFields.push({
                        name: ":busts_in_silhouette: Nickname",
                        value: message.guild.members.get(target.id).nickname,
                        inline: true
                    });
                }
                if (userEntry.dataPrivacy.publicLevel || userEntry.id === message.author.id) {
                    const levelDetails = getLevelDetails(userEntry.experience.level, userEntry.experience.expCount);
                    embedFields.push({
                        name: ":star: Global experience",
                        value: "Level " + userEntry.experience.level + "\nExp: " + Math.round(userEntry.experience.expCount) + `\nLevel progress: ${(levelDetails.levelProgress)} (${levelDetails.percentage}%)`,
                        inline: true
                    });
                }
                if (guildEntry.levelSystem.enabled && guildEntry.levelSystem.users.filter(u => u.id === target.id).length !== 0) {
                    const userPos = guildEntry.levelSystem.users.findIndex(function(element) {
                        return element.id === target.id;
                    });
                    const levelDetails = getLevelDetails(guildEntry.levelSystem.users[userPos].level, guildEntry.levelSystem.users[userPos].expCount);
                    embedFields.push({
                        name: ":star: Local experience",
                        value: "Level " + guildEntry.levelSystem.users[userPos].level + "\nExp: " + Math.round(guildEntry.levelSystem.users[userPos].expCount) + `\nLevel progress: ${(levelDetails.levelProgress)} (${levelDetails.percentage}%)`,
                        inline: true
                    });
                }
                if (message.guild.members.get(target.id).hoistRole) {
                    embedFields.push({
                        name: ":mag: Hoist role",
                        value: message.guild.members.get(target.id).hoistRole.name,
                        inline: true
                    });
                }
                if (message.guild.members.get(target.id).highestRole) {
                    embedFields.push({
                        name: ":arrow_up_small: Highest Role",
                        value: message.guild.roles.get(message.guild.members.get(target.id).highestRole).name,
                        inline: true
                    });
                }
                embedFields.push({
                    name: ":date: Created",
                    value: TimeConverter.toHumanDate(target.createdAt),
                    inline: true
                });
                embedFields.push({
                    name: ":date: Joined",
                    value: TimeConverter.toHumanDate(message.guild.members.get(target.id).joinedAt),
                    inline: true
                });
                embedFields.push({
                    name: ":notepad_spiral: Roles",
                    value: message.guild.members.get(target.id).roles.length, //Dont count the everyone role
                    inline: true
                });
                if (message.guild.members.get(target.id).displayHexColor) {
                    embedFields.push({
                        name: ":large_blue_diamond: HEX color",
                        value: message.guild.members.get(target.id).displayHexColor,
                        inline: true
                    });
                }
                if (userEntry.dataPrivacy.publicPoints || userEntry.id === message.author.id) {
                    embedFields.push({
                        name: ":ribbon: Points",
                        value: new String(Math.round(userEntry.generalSettings.points)),
                        inline: true
                    });
                }
                if (userEntry.dataPrivacy.publicLove || userEntry.id === message.author.id) {
                    embedFields.push({
                        name: ":heart: Love points",
                        value: userEntry.generalSettings.lovePoints,
                        inline: true
                    });
                }
                resolve(await message.channel.createMessage({
                    embed: {
                        title: ':bust_in_silhouette: User info',
                        author: {
                            name: `${message.guild.members.get(target.id).tag}`,
                            icon_url: avatar
                        },
                        fields: embedFields,
                        timestamp: new Date(),
                        image: {
                            url: avatar
                        }
                    }
                }));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Uinfo();