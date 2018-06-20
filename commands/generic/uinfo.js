'use strict';
//@ts-check

const Command = require('../../util/helpers/modules/Command');

class Uinfo extends Command {
    constructor() {
        super();
        this.help = {
            name: 'uinfo',
            category: 'generic',
            description: 'Display some ~~useless~~ info about the user',
            usage: '{prefix}uinfo'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['userinfo', 'profile'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        const user = await this.getUserFromText({ message, client, text: args[0] });
        const target = user ? client.extendedUser(user) : client.extendedUser(message.author);
        const targetEntry = target.id !== message.author.id ? await client.database.getUser(target.id) : userEntry;
        const localLevelDetails = client.getLevelDetails(guildEntry.getLevelOf(target.id));
        const globalLevelDetails = client.getLevelDetails(targetEntry.getLevel());
        const userExp = guildEntry.experience.members.find(u => u.id === target.id) ? guildEntry.experience.members.find(u => u.id === target.id).experience : 0;
        const member = message.channel.guild.members.get(target.id);

        let embedFields = [];

        if (member.nick) {
            embedFields.push({
                name: ":busts_in_silhouette: Nickname",
                value: member.nick,
                inline: true
            });
        }

        const highestRole = this.getHighestRole(target.id, message.channel.guild);

        embedFields.push({
            name: ":arrow_up_small: Highest Role",
            value: highestRole ? `<@&${highestRole.id}>` : `<@&${message.channel.guild.id}>`,
            inline: true
        });

        embedFields.push({
            name: ":notepad_spiral: Roles",
            value: member.roles.map(r => `<@&${message.channel.guild.roles.get(r).id}>`).join(', ') + ` (${member.roles.length})`,
        });

        embedFields.push({
            name: ":date: Created",
            value: client.timeConverter.toHumanDate(member.createdAt),
            inline: true
        });

        embedFields.push({
            name: ":date: Joined",
            value: client.timeConverter.toHumanDate(member.joinedAt),
            inline: true
        });

        embedFields.push({
            name: ":star: Local experience",
            value: "Level: " + localLevelDetails.level + "\n" +
                "Exp: " + userExp + "\n" +
                "Level progress: " + (userExp - localLevelDetails.thisLevelExp) + " / " + (localLevelDetails.nextLevelExp - localLevelDetails.thisLevelExp) + ` (${(((userExp - localLevelDetails.thisLevelExp)/(localLevelDetails.nextLevelExp - localLevelDetails.thisLevelExp))*100).toFixed(2)}%)`,
        });

        embedFields.push({
            name: ':star: Global experience',
            value: "Level: " + globalLevelDetails.level + "\n" +
                "Exp: " + targetEntry.experience.amount + "\n" +
                "Level progress: " + (targetEntry.experience.amount - globalLevelDetails.thisLevelExp) + " / " + (globalLevelDetails.nextLevelExp - globalLevelDetails.thisLevelExp) + ` (${(((targetEntry.experience.amount - globalLevelDetails.thisLevelExp)/(globalLevelDetails.nextLevelExp - globalLevelDetails.thisLevelExp))*100).toFixed(2)}%)`
        });

        embedFields.push({
            name: ":moneybag: Coins",
            value: `${targetEntry.economy.coins}`,
            inline: true
        });

        embedFields.push({
            name: ':heart: Love points',
            value: `${targetEntry.love.amount}`,
            inline: true
        });

        return message.channel.createMessage({
            embed: {
                title: `:bust_in_silhouette: User info`,
                author: {
                    name: target.tag,
                    icon_url: target.avatarURL
                },
                fields: embedFields,
                image: {
                    url: target.avatarURL
                },
                timestamp: new Date(),
                image: {
                    url: target.avatarURL
                },
                color: client.config.options.embedColor
            }
        });
    }
}

module.exports = new Uinfo();