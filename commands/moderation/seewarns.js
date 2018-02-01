const timeConverter = require('../../util/modules/timeConverter');

class SeeWarns {
    constructor() {
        this.help = {
            name: 'seewarns',
            usage: 'seewarns <user_resolvable>',
            description: 'Shows all the warns of the user, with their reason, the date and the moderator who did it'
        }
        this.conf = {
            aliases: ['warns'],
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                const member = await message.getUserResolvable({ max: 1, guildOnly: true }).then(m => m.first());
                if (!member) return resolve(await message.channel.createMessage(`:x: You did not specified an user for me to show their warns`));
                if (!guildEntry.moderation.users.find(u => u.id === member.id) || !guildEntry.moderation.users.find(u => u.id === member.id).warns[0]) {
                    return resolve(await message.channel.createMessage(`:x: The user \`${member.tag}\` hasn't any warn`));
                }
                const messageStructure = function(warnCase) {
                    return {
                        embed: {
                            title: `Entry ID #${guildEntry.moderation.users.find(u => u.id === member.id).warns.findIndex(w => w.timestamp === warnCase.timestamp) + 1}`,
                            fields: [{
                                name: ':calendar: Date',
                                value: timeConverter.toHumanDate(warnCase.timestamp, true),
                                inline: true
                            }, {
                                name: ':bust_in_silhouette: Moderator',
                                value: `${warnCase.moderator.tag} (<@${warnCase.moderator.id}>)`,
                                inline: true
                            }, {
                                name: ':notepad_spiral: Reason',
                                value: warnCase.reason ? (warnCase.reason.length > 1024 ? warnCase.reason.substr(0, 1015) + '...' : warnCase.reason) : 'None specified'
                            }],
                            image: {
                                url: warnCase.screenshot
                            },
                            color: 0xff9933
                        }
                    }
                }
                let reactions = ["◀", "▶", "❌"];
                let currentPage = 0; //Keep track of where we are in the array
                const interactiveMessage = await message.channel.createMessage(messageStructure(guildEntry.moderation.users.find(u => u.id === member.id).warns[currentPage]));
                const collector = await interactiveMessage.createReactionCollector(reaction => reaction.user.id === message.author.id);
                for (let i = 0; i < reactions.length; i++) await interactiveMessage.addReaction(reactions[i]);
                let timeout = setTimeout(function() {
                    collector.stop('timeout');
                }, 120000);
                collector.on('collect', async(r) => {
                    clearTimeout(timeout);
                    interactiveMessage.removeReaction(r.emoji.name, r.user.id);
                    if (r.emoji.name === "◀") {
                        currentPage = currentPage === 0 ? guildEntry.moderation.users.find(u => u.id === member.id).warns.length - 1 : currentPage - 1;
                        await interactiveMessage.edit(messageStructure(guildEntry.moderation.users.find(u => u.id === member.id).warns[currentPage]));
                    } else if (r.emoji.name === "▶") {
                        currentPage = currentPage === guildEntry.moderation.users.find(u => u.id === member.id).warns.length - 1 ? 0 : currentPage + 1;
                        await interactiveMessage.edit(messageStructure(guildEntry.moderation.users.find(u => u.id === member.id).warns[currentPage]));
                    } else if (r.emoji.name === "❌") {
                        collector.stop('aborted');
                    }
                    timeout = setTimeout(function() {
                        collector.stop('timeout');
                    }, 120000);
                });
                collector.on("end", (collected, reason) => {
                    interactiveMessage.delete();
                    resolve(true);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new SeeWarns();