'use strict';

const Command = require('../../util/helpers/modules/Command');
const TimeConverter = require(`../../util/modules/timeConverter.js`);

class Sinfo extends Command {
    constructor() {
        super();
        this.help = {
            name: 'sinfo',
            category: 'generic',
            description: 'Display some ~~useless~~ info about this server',
            usage: '{prefix}sinfo'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ['serverinfo'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message) {
        const embedFields = [{
                name: 'Name',
                value: message.channel.guild.name,
                inline: true
            },
            {
                name: 'ID',
                value: message.channel.guild.id,
                inline: true
            },
            {
                name: 'Created the',
                value: TimeConverter.toHumanDate(message.channel.guild.createdAt, true)
            },
            {
                name: 'I\'m here since the',
                value: TimeConverter.toHumanDate(message.channel.guild.joinedAt, true)
            },
            {
                name: 'Owner',
                value: `<@!${message.channel.guild.ownerID}>`,
                inline: true
            },
            {
                name: 'Region',
                value: message.channel.guild.region,
                inline: true
            },
            {
                name: 'Members',
                value: message.channel.guild.memberCount
            },
            {
                name: 'Shard',
                value: message.channel.guild.shard.id,
                inline: true
            },
            {
                name: 'Latest members',
                value: Array.from(message.channel.guild.members.values()).sort((a, b) => b.joinedAt - a.joinedAt).map(m => `<@!${m.id}>`).splice(0, 5).join(` > `)
            },
            {
                name: 'Text channels / Voice channels',
                value: `${message.channel.guild.channels.filter(c => c.type === 0).length} / ${message.channel.guild.channels.filter(c => c.type === 2).length}`,
                inline: true
            }, {
                name: '2FA',
                value: message.channel.guild.mfaLevel === 0 ? `:x:` : `:white_check_mark:`,
                inline: true
            }, {
                name: 'Roles',
                value: message.channel.guild.roles.size
            }
        ];
        message.channel.createMessage({
            embed: {
                title: `${message.channel.guild.name}'s info`,
                fields: embedFields,
                image: {
                    url: message.channel.guild.iconURL ? message.channel.guild.iconURL : undefined
                }
            }
        });
    }
}

module.exports = new Sinfo();