exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!client.clientData.get('changelogs')) {
                const defaultChangelogs = {
                    changelogs: [],
                    version: client.database.version,
                    lastUpdateDate: false
                }
                client.clientData.set('changelogs', defaultChangelogs);
            }
            const changelogs = client.clientData.get('changelogs');
            if (changelogs.changelogs.length === 0) {
                return await message.channel.send(":x: There's no changelog to show :v");
            }
            const interactiveMessage = await message.channel.send(`__**${changelogs.changelogs[0].type}: ${changelogs.changelogs[0].name}**__ (${changelogs.changelogs[0].date})\n\n${changelogs.changelogs[0].content}\n\n:book:  [Page 1/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`);
            await interactiveMessage.react("⏪");
            await interactiveMessage.react("◀");
            await interactiveMessage.react("▶");
            await interactiveMessage.react("⏩");
            await interactiveMessage.react("❌");
            var currentPage = 0; //Keep track of where we are in the array
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id)
            var timeout = setTimeout(function() {
                return interactiveMessage.delete();
            }, 120000);
            collector.on('collect', async(r) => {
                clearTimeout(timeout);
                if (r.emoji.name === "⏪") {
                    if (currentPage !== 0) { //Dont edit if its not needed
                        currentPage = 0;
                        await interactiveMessage.edit(`__**${changelogs.changelogs[0].type}: ${changelogs.changelogs[0].name}**__ (${changelogs.changelogs[0].date})\n\n${changelogs.changelogs[0].content}\n\n:book: [Page ${currentPage + 1}/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`);
                    }
                    await r.remove(message.author.id);
                } else if (r.emoji.name === "◀") {
                    if (currentPage === 0) {
                        currentPage = changelogs.changelogs.length - 1;
                        await interactiveMessage.edit(`__**${changelogs.changelogs[changelogs.changelogs.length - 1].type}: ${changelogs.changelogs[changelogs.changelogs.length - 1].name}**__ (${changelogs.changelogs[changelogs.changelogs.length - 1].date})\n\n${changelogs.changelogs[changelogs.changelogs.length - 1].content}\n\n:book: [Page ${currentPage + 1}/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`);
                    } else {
                        currentPage = currentPage - 1;
                        await interactiveMessage.edit(`__**${changelogs.changelogs[currentPage].type}: ${changelogs.changelogs[currentPage].name}**__ (${changelogs.changelogs[currentPage].date})\n\n${changelogs.changelogs[currentPage].content}\n\n:book: [Page ${currentPage + 1}/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`);
                    }
                    await r.remove(message.author.id);
                } else if (r.emoji.name === "▶") {
                    if (currentPage === changelogs.changelogs.length - 1) {
                        currentPage = 0;
                        await interactiveMessage.edit(`__**${changelogs.changelogs[0].type}: ${changelogs.changelogs[0].name}**__ (${changelogs.changelogs[0].date})\n\n${changelogs.changelogs[0].content}\n\n:book: [Page ${currentPage + 1}/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`)
                    } else {
                        currentPage = currentPage + 1;
                        await interactiveMessage.edit(`__**${changelogs.changelogs[currentPage].type}: ${changelogs.changelogs[currentPage].name}**__ (${changelogs.changelogs[currentPage].date})\n\n${changelogs.changelogs[currentPage].content}\n\n:book: [Page ${currentPage + 1}/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`)
                    }
                    await r.remove(message.author.id);
                } else if (r.emoji.name === "⏩") {
                    if (currentPage !== changelogs.changelogs.length - 1) { //Dont edit if its not needed
                        currentPage = changelogs.changelogs.length - 1;
                        await interactiveMessage.edit(`__**${changelogs.changelogs[changelogs.changelogs.length - 1].type}: ${changelogs.changelogs[changelogs.changelogs.length - 1].name}**__ (${changelogs.changelogs[changelogs.changelogs.length - 1].date})\n\n${changelogs.changelogs[changelogs.changelogs.length - 1].content}\n\n:book: [Page ${currentPage + 1}/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`);
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