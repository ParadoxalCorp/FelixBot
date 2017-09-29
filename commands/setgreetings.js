exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            let args = message.content.split(/\s+/gim);
            args.shift();
            if (args[0] === "raw") { //---------------------------------Return raw message------------------------------------------
                if (!guildEntry.onEvent.guildMemberAdd.greetings.message && !guildEntry.onEvent.guildMemberAdd.greetings.embed) return resolve(await message.channel.send(`:x: There's no greetings message set yet`));
                return resolve(await message.channel.send('```\n' + (guildEntry.onEvent.guildMemberAdd.greetings.message || guildEntry.onEvent.guildMemberAdd.greetings.embed.embed.description) + "```"));
            }
            //----------------------------------------------------Interactive message-----------------------------------------
            let status = guildEntry.onEvent.guildMemberAdd.greetings.error || ':white_check_mark:';
            let method = 'Disabled';
            if (guildEntry.onEvent.guildMemberAdd.greetings.enabled && !guildEntry.onEvent.guildMemberAdd.greetings.channel) method = 'Direct message';
            else {
                if (guildEntry.onEvent.guildMemberAdd.greetings.enabled) {
                    let greetingsChan = message.guild.channels.get(guildEntry.onEvent.guildMemberAdd.greetings.channel);
                    if (greetingsChan) {
                        method = "#" + greetingsChan.name;
                    } else {
                        method = "#deleted-channel"
                    }
                }
            }
            let embedDescription = guildEntry.onEvent.guildMemberAdd.greetings.embed;
            if (embedDescription) embedDescription = guildEntry.onEvent.guildMemberAdd.greetings.embed.embed.description;
            let greetings = guildEntry.onEvent.guildMemberAdd.greetings.message || embedDescription || "Nothing here yet, react with :pencil: to start writing";
            greetings = greetings.replace(/\%USER\%/gim, `<@${message.author.id}>`).replace(/\%USERNAME\%/gim, `${message.author.username}`).replace(/\%USERTAG%/gim, `${message.author.tag}`).replace(/\%GUILD\%/gim, `${message.guild.name}`);
            const mainObject = function(status, method, greetings) {
                return {
                    embed: {
                        title: ':inbox_tray: Greetings settings',
                        description: `Status: ${status}\n\n**Welcome to the greetings settings, here's how to set the greetings:**\n:incoming_envelope: => Edit where Felix greets (channel or private message)\n:pencil: => Edit the content of the greetings\n:postbox: => Set the channel where Felix should send the greetings\n:white_check_mark: => Save changes\n:x: => Discard changes\n\n**To:** ${method}\n\n**Preview:**\n${greetings.substr(0, 1500)}`,
                        footer: {
                            text: `Time of inactivity before shutdown: 120 seconds`
                        }
                    }
                }
            }
            const interactiveMessage = await message.channel.send(mainObject(status, method, greetings));
            async function updateMainMessage() {
                if (method !== "Direct message" && method !== "Disabled" && method !== "Edition enabled: You can write the channel name") {
                    let greetingsChan = message.guild.channels.get(guildEntry.onEvent.guildMemberAdd.greetings.channel);
                    if (greetingsChan) {
                        method = "#" + greetingsChan.name;
                    } else {
                        method = "#deleted-channel"
                    }
                }
                greetings = greetings.replace(/\%USER\%/gim, `<@${message.author.id}>`).replace(/\%USERNAME\%/gim, `${message.author.username}`).replace(/\%USERTAG%/gim, `${message.author.tag}`).replace(/\%GUILD\%/gim, `${message.guild.name}`);
                await interactiveMessage.edit(mainObject(status, method, greetings));
            }
            const mainCollector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            let mainReactions = ['📨', '📝', '📮', '✅', '❌'];
            for (let i = 0; i < mainReactions.length; i++) {
                await interactiveMessage.react(mainReactions[i]);
            }
            let timeout = setTimeout(function() { //
                mainCollector.stop('timeout');
            }, 120000);
            //--------------------------------------------------------------------------On collector collect-------------------------------------
            mainCollector.on('collect', async(r) => {
                clearTimeout(timeout); //Reset timeout
                if (r.emoji.name === mainReactions[0]) { //---------------------------Change method------------------------------------
                    if (method === "Disabled") {
                        guildEntry.onEvent.guildMemberAdd.greetings.enabled = true; //If disabled switch to dm
                        guildEntry.onEvent.guildMemberAdd.greetings.dm = true;
                        method = "Direct message";
                    } else if (method === "Direct message") {
                        if (!guildEntry.onEvent.guildMemberAdd.greetings.channel) { //If dm switch to channel
                            guildEntry.onEvent.guildMemberAdd.greetings.channel = message.channel.id;
                            guildEntry.onEvent.guildMemberAdd.greetings.dm = false;
                            method = `#${message.channel.name}`;
                        } else {
                            method = guildEntry.onEvent.guildMemberAdd.greetings.channel;
                            guildEntry.onEvent.guildMemberAdd.greetings.dm = false;
                        }
                    } else if (method !== "Disabled" && method !== "Direct message") { //Finally if channel switch to disabled
                        guildEntry.onEvent.guildMemberAdd.greetings.enabled = false;
                        method = "Disabled";
                    }
                    updateMainMessage();
                } else if (r.emoji.name === mainReactions[1]) { //--------------------------------Change greetings------------------------------------
                    greetings = 'Edition enabled: You can write the new greetings';
                    updateMainMessage();
                    try {
                        const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                            max: 1,
                            time: 120000,
                            errors: ["time"]
                        });
                        guildEntry.onEvent.guildMemberAdd.greetings.message = collected.first().content;
                        greetings = collected.first().content;
                        updateMainMessage();
                        if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await collected.first().delete();
                    } catch (e) {
                        mainCollector.stop('timeout');
                    }
                } else if (r.emoji.name === mainReactions[2]) { //-----------------------------------Set channel-----------------------------------------
                    method = 'Edition enabled: You can write the channel name';
                    updateMainMessage();
                    try {
                        const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                            max: 1,
                            time: 120000,
                            errors: ["time"]
                        });
                        if (!message.guild.channels.find('name', collected.first().content.toLowerCase())) {
                            guildEntry.onEvent.guildMemberAdd.greetings.enabled = false;
                            method = "Disabled";
                            let notFoundMessage = await message.channel.send(":x: Channel not found");
                            notFoundMessage.delete(5000);
                        } else {
                            method = message.guild.channels.find('name', collected.first().content.toLowerCase()).id;
                            guildEntry.onEvent.guildMemberAdd.greetings.channel = message.guild.channels.find('name', collected.first().content.toLowerCase()).id;
                        }
                        updateMainMessage();
                        if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await collected.first().delete();
                    } catch (e) {
                        mainCollector.stop('timeout');
                    }
                } else if (r.emoji.name === mainReactions[3]) { //-----------------------------------------Confirm-----------------------------------
                    mainCollector.stop('confirmed');
                } else if (r.emoji.name === mainReactions[4]) { //----------------------------------------Abort-----------------------------------------
                    mainCollector.stop('aborted');
                }
                await r.remove(message.author.id); //Delete user reaction   
                timeout = setTimeout(function() { //
                    mainCollector.stop('timeout');
                }, 120000);
            });
            //-------------------------------------------------------On collector end----------------------------------------------------------
            mainCollector.on('end', async(collected, reason) => {
                if (reason === "timeout") {
                    await interactiveMessage.clearReactions();
                    await interactiveMessage.edit({
                        embed: {
                            description: 'Timeout: Cancelling the process...'
                        }
                    });
                    return resolve(await interactiveMessage.delete(5000));
                } else if (reason === "aborted") {
                    return resolve(await interactiveMessage.delete());
                } else if (reason === "confirmed") {
                    await interactiveMessage.clearReactions();
                    client.guildData.set(message.guild.id, guildEntry);
                    await interactiveMessage.edit({
                        embed: {
                            description: 'Changes saved :white_check_mark:'
                        }
                    });
                    return resolve(await interactiveMessage.delete(5000));
                }
            });
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
}

exports.conf = {
    disabled: false,
    aliases: ['greetings'],
    permLevel: 2,
    guildOnly: true
}
exports.help = {
    name: 'setgreetings',
    parameters: '`raw`',
    description: 'Set the greetings of the server',
    usage: 'setgreetings',
    category: 'settings',
    detailedUsage: '\n**FLAGS**\n`%USER%` The user that joined the server, will look like `@Bobby`\n`%USERNAME%` The username of the user, will look like `Bobby`\n`%USERTAG%` The username and the discriminator of the user, will look like `Bobby#0000`\n`%GUILD%` The server name, will look like `Bobby\'s server`\n\n`{prefix}setgreetings raw` Will return the raw message(without flags replaced) that has been set'
};