exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!client.coreData.changelogs || client.coreData.changelogs.value.length < 1) return resolve(await message.channel.send(`:x: It seems there's no changelog yet`));
            const interactiveMessage = await message.channel.send(`__**${client.coreData.changelogs.value[0].type}: ${client.coreData.changelogs.value[0].name}**__ (${client.coreData.changelogs.value[0].date})\n\n${client.coreData.changelogs.value[0].content}\n\n:book:  [Page 1/${client.coreData.changelogs.value.length}] :gear: Latest release: ${client.config.version}`);
            let reactions = ["⏪", "◀", "▶", "▶", "⏩", "❌"];
            for (let i = 0; i < reactions.length; i++) await interactiveMessage.react(reactions[i]);
            let currentPage = 0; //Keep track of where we are in the array
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id)
            let timeout = setTimeout(function() {
                return interactiveMessage.delete();
            }, 120000);
            collector.on('collect', async(r) => {
                clearTimeout(timeout);
                if (r.emoji.name === "⏪") {
                    if (currentPage !== 0) { //Dont edit if its not needed
                        currentPage = 0;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs.value[0].type}: ${client.coreData.changelogs.value[0].name}**__ (${client.coreData.changelogs.value[0].date})\n\n${client.coreData.changelogs.value[0].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.value.length}] :gear: Latest release: ${client.config.version}`);
                    }
                    await r.remove(message.author.id);
                } else if (r.emoji.name === "◀") {
                    if (currentPage === 0) {
                        currentPage = client.coreData.changelogs.value.length - 1;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].type}: ${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].name}**__ (${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].date})\n\n${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.value.length}] :gear: Latest release: ${client.config.version}`);
                    } else {
                        currentPage = currentPage - 1;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs.value[currentPage].type}: ${client.coreData.changelogs.value[currentPage].name}**__ (${client.coreData.changelogs.value[currentPage].date})\n\n${client.coreData.changelogs.value[currentPage].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.value.length}] :gear: Latest release: ${client.config.version}`);
                    }
                    await r.remove(message.author.id);
                } else if (r.emoji.name === "▶") {
                    if (currentPage === client.coreData.changelogs.value.length - 1) {
                        currentPage = 0;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs.value[0].type}: ${client.coreData.changelogs.value[0].name}**__ (${client.coreData.changelogs.value[0].date})\n\n${client.coreData.changelogs.value[0].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.value.length}] :gear: Latest release: ${client.config.version}`)
                    } else {
                        currentPage = currentPage + 1;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs.value[currentPage].type}: ${client.coreData.changelogs.value[currentPage].name}**__ (${client.coreData.changelogs.value[currentPage].date})\n\n${client.coreData.changelogs.value[currentPage].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.value.length}] :gear: Latest release: ${client.config.version}`)
                    }
                    await r.remove(message.author.id);
                } else if (r.emoji.name === "⏩") {
                    if (currentPage !== client.coreData.changelogs.value.length - 1) { //Dont edit if its not needed
                        currentPage = client.coreData.changelogs.value.length - 1;
                        await interactiveMessage.edit(`__**${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].type}: ${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].name}**__ (${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].date})\n\n${client.coreData.changelogs.value[client.coreData.changelogs.value.length - 1].content}\n\n:book: [Page ${currentPage + 1}/${client.coreData.changelogs.value.length}] :gear: Latest release: ${client.config.version}`);
                    }
                    await r.remove(message.author.id);
                } else if (r.emoji.name === "❌") {
                    collector.stop('aborted');
                    return resolve(interactiveMessage.delete());
                }
                timeout = setTimeout(function() {
                    collector.stop('timeout');
                    return resolve(interactiveMessage.delete());
                }, 120000);
            });
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'changelog',
    description: 'Display Felix\'s changelogs',
    usage: 'changelog',
    category: 'misc'
};