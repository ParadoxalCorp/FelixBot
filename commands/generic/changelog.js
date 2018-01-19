class Changelog {
    constructor() {
        this.help = {
            name: 'changelog',
            description: 'Display Felix\'s changelogs',
            usage: 'changelog'
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!client.coreData.changelogs || client.coreData.changelogs.length < 1) return resolve(await message.channel.createMessage(`:x: It seems there's no changelog yet`));
                const messageObject = function(page) {
                    return {
                        embed: {
                            title: `__**${client.coreData.changelogs[page].type}: ${client.coreData.changelogs[page].name}**__ (${client.coreData.changelogs[page].date})`,
                            description: `\n${client.coreData.changelogs[page].content}`,
                            footer: {
                                text: `[Page ${page + 1}/${client.coreData.changelogs.length}] | Latest release: ${client.coreData.version}`
                            }
                        }
                    }
                }
                let reactions = ["◀", "▶", "❌"];
                let currentPage = 0; //Keep track of where we are in the array
                const interactiveMessage = await message.channel.createMessage(messageObject(currentPage));
                const collector = await interactiveMessage.createReactionCollector(reaction => reaction.user.id === message.author.id);
                for (let i = 0; i < reactions.length; i++) await interactiveMessage.addReaction(reactions[i]);
                let timeout = setTimeout(function() {
                    collector.stop('timeout');
                }, 120000);
                collector.on('collect', async(r) => {
                    clearTimeout(timeout);
                    interactiveMessage.removeReaction(r.emoji.name, r.user.id);
                    if (r.emoji.name === "◀") {
                        currentPage = currentPage === 0 ? client.coreData.changelogs.length - 1 : currentPage - 1;
                        await interactiveMessage.edit(messageObject(currentPage));
                    } else if (r.emoji.name === "▶") {
                        currentPage = currentPage === client.coreData.changelogs.length - 1 ? 0 : currentPage + 1;
                        await interactiveMessage.edit(messageObject(currentPage));
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

module.exports = new Changelog();