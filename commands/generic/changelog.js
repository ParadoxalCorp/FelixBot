class Changelog {
    constructor() {
        this.help = {
            name: 'changelog',
            description: 'Display Felix\'s changelogs',
            usage: 'changelog'
        }
        this.conf = {
            guildOnly: true,
            disabled: `This command is encountering errors from the gateway and therefore is disabled atm`
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!client.coreData.changelogs || client.coreData.changelogs.length < 1) return resolve(await message.channel.createMessage(`:x: It seems there's no changelog yet`));
                const interactiveMessage = await message.channel.createMessage(`__**${client.coreData.changelogs[0].type}: ${client.coreData.changelogs[0].name}**__ (${client.coreData.changelogs[0].date})\n\n${client.coreData.changelogs[0].content}\n\n:book:  [Page 1/${client.coreData.changelogs.length}] :gear: Latest release: ${client.coreData.version}`);
                let reactions = ["◀", "▶", "❌"];
                let currentPage = 0; //Keep track of where we are in the array
                const collector = await interactiveMessage.createReactionCollector((reaction) => reaction.user.id === message.author.id);
                for (let i = 0; i < reactions.length; i++) await interactiveMessage.addReaction(reactions[i]);
                let timeout = setTimeout(function() {
                    collector.stop('timeout');
                }, 120000);
                collector.on('collect', async(r) => {
                    console.log(r.user);
                    clearTimeout(timeout);
                    interactiveMessage.removeReaction(r.emoji.name, r.user.id);
                    if (r.emoji.name === "◀") {
                        currentPage = currentPage === 0 ? client.coreData.changelogs.length - 1 : currentPage - 1;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs[currentPage].type}: ${client.coreData.changelogs[currentPage].name}**__ (${client.coreData.changelogs[currentPage].date})\n\n${client.coreData.changelogs[currentPage].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.length}] :gear: Latest release: ${client.coreData.version}`);
                    } else if (r.emoji.name === "▶") {
                        currentPage = currentPage === client.coreData.changelogs.length - 1 ? 0 : currentPage + 1;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs[currentPage].type}: ${client.coreData.changelogs[currentPage].name}**__ (${client.coreData.changelogs[currentPage].date})\n\n${client.coreData.changelogs[currentPage].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.length}] :gear: Latest release: ${client.coreData.version}`)
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