const fs = require("fs-extra");
exports.run = async(client, message) => {
    try {
        if (!client.clientDatas.get('changelogs')) {
            const defaultChangelogs = {
                changelogs: [],
                version: client.database.Data.global[0].version,
                lastUpdateDate: false
            }
            client.clientDatas.set('changelogs', defaultChangelogs);
        }
        const changelogs = client.clientDatas.get('changelogs');
        if (changelogs.changelogs.length === 0) {
            return await message.channel.send(":x: There's no changelogs to show :v");
        }
        try {
            const interactiveMessage = await message.channel.send(`__**${changelogs.changelogs[0].type}: ${changelogs.changelogs[0].name}**__ (${changelogs.changelogs[0].date})\n\n${changelogs.changelogs[0].content}\n\n:book:  [Page 1/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`);
            await interactiveMessage.react("⏪");
            await interactiveMessage.react("◀");
            await interactiveMessage.react("▶");
            await interactiveMessage.react("⏩");
            await interactiveMessage.react("❌");
            var currentPage = 0; //Keep track of where we are in the array
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id)
            collector.on('collect', async(r) => {
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
                } else if (r.emoji.name === "⏩"){
                    if (currentPage !== changelogs.changelogs.length - 1) { //Dont edit if its not needed
                        currentPage = changelogs.changelogs.length - 1;
                        await interactiveMessage.edit(`__**${changelogs.changelogs[changelogs.changelogs.length - 1].type}: ${changelogs.changelogs[changelogs.changelogs.length - 1].name}**__ (${changelogs.changelogs[changelogs.changelogs.length - 1].date})\n\n${changelogs.changelogs[changelogs.changelogs.length - 1].content}\n\n:book: [Page ${currentPage + 1}/${changelogs.changelogs.length}] :gear: Latest release: ${changelogs.version}`);
                    } 
                    await r.remove(message.author.id);                    
                } else if (r.emoji.name === "❌") {
                    return await interactiveMessage.delete();
                }
            });
        } catch (err) {
            await message.channel.send(":x: An error occured :v");
            return console.error(err);
        }
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'changelog',
    description: 'Display Felix\'s changelogs',
    usage: 'changelog',
    category: 'miscellaneous'
};
