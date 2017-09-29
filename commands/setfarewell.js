exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            let args = message.content.split(/\s+/gim);
            args.shift();
            if (args[0] === "raw") { //---------------------------------Return raw message------------------------------------------
                if (!guildEntry.onEvent.guildMemberRemove.farewell.message && !guildEntry.onEvent.guildMemberRemove.farewell.embed) return resolve(await message.channel.send(`:x: There's no farewell message set yet`));
                return resolve(await message.channel.send('```\n' + (guildEntry.onEvent.guildMemberRemove.farewell.message || guildEntry.onEvent.guildMemberRemove.farewell.embed.embed.description) + "```"));
            }
            //----------------------------------------------------Interactive message-----------------------------------------
            let status = guildEntry.onEvent.guildMemberRemove.farewell.error || ':white_check_mark:';
            let method = 'Disabled';
            if (guildEntry.onEvent.guildMemberRemove.farewell.enabled) {
                let farewellChan = message.guild.channels.get(guildEntry.onEvent.guildMemberRemove.farewell.channel);
                if (farewellChan) {
                    method = "#" + farewellChan.name;
                } else {
                    method = "#deleted-channel"
                }
            }
            let embedDescription = guildEntry.onEvent.guildMemberRemove.farewell.embed;
            if (embedDescription) embedDescription = guildEntry.onEvent.guildMemberRemove.farewell.embed.embed.description;
            let farewell = guildEntry.onEvent.guildMemberRemove.farewell.message || embedDescription || "Nothing here yet, react with :pencil: to start writing";
            farewell = farewell.replace(/\%USERNAME\%/gim, `${message.author.username}`).replace(/\%USERTAG%/gim, `${message.author.tag}`).replace(/\%GUILD\%/gim, `${message.guild.name}`);
            const mainObject = function(status, method, farewell) {
                return {
                    embed: {
                        title: ':outbox_tray: Farewell settings',
                        description: `Status: ${status}\n\n**Welcome to the farewell settings, here's how to set the farewell:**\n:incoming_envelope: => Edit where Felix should send the farewell (channel/disabled)\n:pencil: => Edit the content of the farewell\n:postbox: => Set the channel where Felix should send the farewell\n:white_check_mark: => Save changes\n:x: => Discard changes\n\n**To:** ${method}\n\n**Preview:**\n${farewell.substr(0, 1500)}`,
                        footer: {
                            text: `Time of inactivity before shutdown: 120 seconds`
                        }
                    }
                }
            }
            const interactiveMessage = await message.channel.send(mainObject(status, method, farewell));
            async function updateMainMessage() {
                if (method !== "Disabled" && method !== "Edition enabled: You can write the channel name") {
                    let farewellChan = message.guild.channels.get(guildEntry.onEvent.guildMemberRemove.farewell.channel);
                    if (farewellChan) {
                        method = "#" + farewellChan.name;
                    } else {
                        method = "#deleted-channel"
                    }
                }
                farewell = farewell.replace(/\%USERNAME\%/gim, `${message.author.username}`).replace(/\%USERTAG%/gim, `${message.author.tag}`).replace(/\%GUILD\%/gim, `${message.guild.name}`);
                await interactiveMessage.edit(mainObject(status, method, farewell));
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
                        guildEntry.onEvent.guildMemberRemove.farewell.enabled = true; //If disabled switch to channel
                        if (!guildEntry.onEvent.guildMemberRemove.farewell.channel) {
                            guildEntry.onEvent.guildMemberRemove.farewell.channel = message.channel.id;
                            method = `#${message.channel.name}`;
                        } else {
                            method = guildEntry.onEvent.guildMemberRemove.farewell.channel;
                        }
                    } else { //Finally if channel switch to disabled
                        guildEntry.onEvent.guildMemberRemove.farewell.enabled = false;
                        method = "Disabled";
                    }
                    updateMainMessage();
                } else if (r.emoji.name === mainReactions[1]) { //--------------------------------Change farewell------------------------------------
                    farewell = 'Edition enabled: You can write the new farewell';
                    updateMainMessage();
                    try {
                        const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                            max: 1,
                            time: 120000,
                            errors: ["time"]
                        });
                        guildEntry.onEvent.guildMemberRemove.farewell.message = collected.first().content;
                        farewell = collected.first().content;
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
                            guildEntry.onEvent.guildMemberRemove.farewell.enabled = false;
                            method = "Disabled";
                            let notFoundMessage = await message.channel.send(":x: Channel not found");
                            notFoundMessage.delete(5000);
                        } else {
                            method = message.guild.channels.find('name', collected.first().content.toLowerCase()).id;
                            guildEntry.onEvent.guildMemberRemove.farewell.channel = message.guild.channels.find('name', collected.first().content.toLowerCase()).id;
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
    aliases: ['farewell'],
    guildOnly: true
}
exports.help = {
    name: 'setfarewell',
    parameters: '`raw`',
    description: 'Set the farewell of the server',
    usage: 'setfarewell',
    category: 'settings',
    detailedUsage: '**FLAGS**\n`%USERNAME%` The username of the user, will look like `Bobby`\n`%USERTAG%` The username and the discriminator of the user, will look like `Bobby#0000`\n`%GUILD%` The server name, will look like `Bobby\'s server`\n\n`{prefix}setfarewell raw` Will return the raw message(without flags replaced) that has been set'
};