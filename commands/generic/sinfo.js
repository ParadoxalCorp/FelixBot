'use strict';

const Command = require('../../util/helpers/Command');
const TimeConverter = require(`../../util/modules/timeConverter.js`);

class Sinfo extends Command {
    constructor() {
        super();
        this.help = {
            name: 'sinfo',
            category: 'generic',
            description: 'Display some ~~useless~~ info about this server',
            usage: '{prefix} sinfo'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ['serverinfo'],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message) {
        const embedFields = [{
            name: 'Name',
            value: message.guild.name,
            inline: true
        },
        {
            name: 'ID',
            value: message.guild.id,
            inline: true
        },
        {
            name: 'Created the',
            value: TimeConverter.toHumanDate(message.guild.createdAt, true)
        },
        {
            name: 'I\'m here since the',
            value: TimeConverter.toHumanDate(message.guild.joinedAt, true)
        },
        {
            name: 'Owner',
            value: `<@${message.guild.ownerID}> ${message.guild.members.has(message.guild.ownerID) ? '(' + message.guild.members.get(message.guild.ownerID).tag + ')' : ''}`,
            inline: true
        },
        {
            name: 'Region',
            value: message.guild.region,
            inline: true
        },
        {
            name: 'Members',
            value: message.guild.memberCount
        },
        {
            name: 'Shard',
            value: message.guild.shard.id,
            inline: true
        },
        {
            name: 'Latest members',
            value: Array.from(message.guild.members.values()).sort((a, b) => b.joinedAt - a.joinedAt).map(m => m.tag).splice(0, 5).join(` > `)
        },
        {
            name: 'Text channels / Voice channels',
            value: `${message.guild.channels.filter(c => c.type === 0).size} / ${message.guild.channels.filter(c => c.type === 2).size}`,
            inline: true
        }, {
            name: '2FA',
            value: message.guild.mfaLevel === 0 ? `:x:` : `:white_check_mark:`,
            inline: true
        }, {
            name: 'Roles',
            value: message.guild.roles.size
        }];
        message.channel.createMessage({
            embed: {
                title: `${message.guild.name}'s info`,
                fields: embedFields,
                image: {
                    url: message.guild.iconURL ? message.guild.iconURL : undefined
                }
            }
        });
    }
}

module.exports = new Sinfo();
