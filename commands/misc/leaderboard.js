'use strict';

const Command = require('../../util/helpers/modules/Command');

class Leaderboard extends Command {
    constructor() {
        super();
        this.help = {
            name: 'leaderboard',
            category: 'misc',
            description: 'Get the leaderboard of the most loved, richest and active users. Here\'s an example of how to use the command: `{prefix}leaderboard love global`, this will show the global love points leaderboard',
            usage: '{prefix}leaderboard <love|coins|experience> | <global|local>'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['lb'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [{
                description: 'Please choose what leaderboard to show, can be either `love`, `coins` or `experience`',
                possibleValues: [{
                    name: 'love',
                    interpretAs: '{value}'
                }, {
                    name: 'coins',
                    interpretAs: '{value}'
                }, {
                    name: 'experience',
                    interpretAs: '{value}'
                }]
            }, {
                description: 'Please specify whether the leaderboard to show is the global or the local (this server) one, can be either `global` or `local`',
                possibleValues: [{
                    name: 'global',
                    interpretAs: '{value}'
                }, {
                    name: 'local',
                    interpretAs: '{value}'
                }]
            }]
        };
    }

    // eslint-disable-next-line no-unused-vars 
    async run(client, message, args, guildEntry, userEntry) {
        if (!['love', 'coins', 'experience'].includes(args[0].toLowerCase())) {
            return message.channel.createMessage(':x: You didn\'t specified what leaderboard i had to show, please specify either `love`, `coins` or `experience`');
        }
        const leaderboard = args[0].toLowerCase();
        if (leaderboard === 'love') {
            return this.getLoveLeaderboard(client, message, args);
        } else if (leaderboard === 'coins') {
            return this.getCoinsLeaderboard(client, message, args);
        } else if (leaderboard === 'experience') {
            return this.getExperienceLeaderboard(client, message, args, guildEntry);
        }
    }

    async getLoveLeaderboard(client, message, args) {
        const global = args[1] && args[1].toLowerCase() === 'local' ? false : true;
        let leaderboard = Array.from((!global ? client.database.users.filter(u => message.channel.guild.members.has(u.id)) 
        : client.database.users).values()).map(e => client.database._updateDataModel(e, 'user')).sort((a, b) => b.love.amount - a.love.amount);
        if (!leaderboard.length) {
            return message.channel.createMessage(':x: Seems like there is nobody to show on the leaderboard yet');
        }
        const users = await this.fetchUsers(client, leaderboard);
        return message.channel.createMessage({
            embed: {
                title: `${global ? 'Global' : 'Local'} love leaderboard`,
                color: client.config.options.embedColor,
                description: leaderboard.slice(0, 10).map(u => `#${this.getPosition(u.id, leaderboard)} - **${users.get(u.id).tag}**\nLove points: ${u.love.amount}`).join("\n\n"),
                footer: {
                    text: `Your position: #${leaderboard.findIndex(element => element.id === message.author.id) + 1}/${leaderboard.length}`
                },
                thumbnail: {
                    url: global ? client.bot.user.avatarURL : message.channel.guild.iconURL
                }
            }
        });
    }

    async getCoinsLeaderboard(client, message, args) {
        const global = args[1] && args[1].toLowerCase() === 'local' ? false : true;
        let leaderboard = Array.from((!global ? client.database.users.filter(u => message.channel.guild.members.has(u.id)) 
        : client.database.users).values()).map(e => client.database._updateDataModel(e, 'user')).sort((a, b) => b.economy.coins - a.economy.coins);
        if (!leaderboard.length) {
            return message.channel.createMessage(':x: Seems like there is nobody to show on the leaderboard yet');
        }
        const users = await this.fetchUsers(client, leaderboard);
        return message.channel.createMessage({
            embed: {
                title: `${global ? 'Global' : 'Local'} coins leaderboard`,
                color: client.config.options.embedColor,
                description: leaderboard.slice(0, 10).map(u => `#${this.getPosition(u.id, leaderboard)} - **${users.get(u.id).tag}**\nCoins: ${u.economy.coins}`).join("\n\n"),
                footer: {
                    text: `Your position: #${leaderboard.findIndex(element => element.id === message.author.id) + 1}/${leaderboard.length}`
                },
                thumbnail: {
                    url: global ? client.bot.user.avatarURL : message.channel.guild.iconURL
                }
            }
        });
    }

    async getExperienceLeaderboard(client, message, args, guildEntry) {
        const global = args[1] && args[1].toLowerCase() === 'local' ? false : true;
        let leaderboard = global ? client.database.users.map(u => u) : guildEntry.experience.members;
        if (global) {
            leaderboard = leaderboard.map(e => client.database._updateDataModel(e, 'user')).sort((a, b) => b.experience.amount - a.experience.amount).map(u => {
                u.levelDetails = client.getLevelDetails(new client.extendedUserEntry(u).getLevel());
                return u;
            });
        } else {
            leaderboard = leaderboard.map(e => client.database._updateDataModel(e, 'guild')).sort((a, b) => b.experience - a.experience).map(m => {
                m.levelDetails = client.getLevelDetails(guildEntry.getLevelOf(m.id));
                return m;
            });
        }
        if (!leaderboard.length) {
            return message.channel.createMessage(':x: Seems like there is nobody to show on the leaderboard yet');
        }
        const users = await this.fetchUsers(client, leaderboard);
        return message.channel.createMessage({
            embed: {
                title: `${global ? 'Global' : 'Local'} experience leaderboard`,
                color: client.config.options.embedColor,
                description: leaderboard.slice(0, 10).map(u => `#${this.getPosition(u.id, leaderboard)} - **${users.get(u.id).tag}**\nLevel: ${u.levelDetails.level} | ${global ? 'Global' : 'Local'} experience: ${global ? u.experience.amount : u.experience}`).join("\n\n"),
                footer: leaderboard.find(u => u.id === message.author.id) ? {
                    text: `Your position: #${leaderboard.findIndex(element => element.id === message.author.id) + 1}/${leaderboard.length}`
                } : undefined,
                thumbnail: {
                    url: global ? client.bot.user.avatarURL : message.channel.guild.iconURL
                }
            }
        });
    }

    async fetchUsers(client, leaderboard) {
        let resolvedUsers = new client.collection();
        await Promise.all(leaderboard.slice(0, 10).map(u => client.fetchUser(u.id)))
            .then(fetchedUsers => {
                let i = 0;
                for (let user of fetchedUsers) {
                    if (!user) {
                        user = {
                            tag: 'Unknown User'
                        };
                    }
                    if (!user.tag) {
                        user.tag = `${user.username}#${user.discriminator}`;
                    }
                    resolvedUsers.set(leaderboard[i].id, user);
                    i++;
                }
            });
        return resolvedUsers;
    }

    getPosition(id, target) {
        let userPosition = target.findIndex(u => u.id === id);
        if (userPosition === 0) {
            return ":trophy:";
        }
        else if (userPosition === 1) {
            return ":second_place:";
        }
        else if (userPosition === 2) {
            return ":third_place:";
        } else {
            return userPosition + 1;
        }
    }
}

module.exports = new Leaderboard();