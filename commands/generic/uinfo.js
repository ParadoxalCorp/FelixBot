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
            usage: '{prefix} uinfo'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['userinfo'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        const user = await this.getUserFromText({ message, client, text: args[0] })
        const target = user !== false ? user : message.author;

        const thisLevel = guildEntry.getLevelOf( target.id );
        const LevelDetails = client.getLevelDetails(client, thisLevel );
        const nextLevelDetails = client.getLevelDetails(client, thisLevel + 1 );
        const userExp = guildEntry.experience.members.filter(u => u.id === target.id )[0].experience;



        let embedFields = [];

        if (message.channel.guild.members.filter(m => m.id === target.id )[0].nick !== null) {
            embedFields.push({
                name: ":busts_in_silhouette: Nickname",
                value: message.channel.guild.members.filter(m => m.id === target.id)[0].nick,
                inline: true
            });
        }

        embedFields.push({
            name: ":star: Local experience",
            value:
                "Level " + thisLevel + "\n" +
                "Exp: " + userExp + "\n" +
                "Level progress " + (userExp - LevelDetails.thisLevelExp ) + " / " + nextLevelDetails.thisLevelExp +  ` (${(((userExp - LevelDetails.thisLevelExp )/nextLevelDetails.thisLevelExp)*100).toFixed(2)}%)`
            ,
            inline: true
        });

        if (message.channel.guild.members.filter(m => m.id === target.id)[0].roles.length !== 0) {
            embedFields.push({
                name: ":arrow_up_small: Highest Role",
                value: this.getHighestRole(target.id, message.channel.guild).name,
                inline: true
            });
        }

        embedFields.push({
            name: ":date: Created",
            value: client.TimeConverter.toHumanDate(message.channel.guild.members.filter(m => m.id === target.id)[0].createdAt),
            inline: true
        });

        embedFields.push({
            name: ":date: Joined",
            value: client.TimeConverter.toHumanDate(message.channel.guild.members.filter(m => m.id === target.id)[0].joinedAt),
            inline: true
        });

        embedFields.push({
            name: ":notepad_spiral: Roles",
            value: message.channel.guild.members.filter(m => m.id === target.id)[0].roles.length, //Dont count the everyone role
            inline: true
        });

        embedFields.push({
            name: ":moneybag: money",
            value : userEntry.economy.coins,
            inline: true
        })


        message.channel.createMessage({
            embed: {
                title: `:bust_in_silhouette: User info`,
                author: {
                    name: `${target.username}#${target.discriminator}`,
                    icon_url: target.avatarURL
                },
                fields: embedFields,
                image: {
                    url: target.avatarURL ? target.avatarURL : undefined
                },
                timestamp: new Date(),
                image: {
                    url: target.avatarURL ? target.avatarURL : undefined
                }
            }
        });
    }
}

module.exports = new Uinfo();