exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            var guildEntry = client.guildData.get(message.guild.id);
            let possibleActions = ['[1] - Reset permissions', '[2] - Reset prefix'];
            if (message.guild.ownerID === message.author.id) possibleActions.push('[3] - Reset everything'); //If actual guild owner add the reset everything option
            let numberReactions = ["1⃣", "2⃣", "3⃣", "4⃣"];
            let mainObject = function(actions) {
                return {
                    embed: {
                        title: ':warning: Danger zone',
                        description: 'Select what you want to do using the reactions, use :white_check_mark: to confirm the changes or :x: to abort\n```\n' + actions.join("\n\n") + '```',
                        footer: {
                            text: 'Time limit: 120 seconds'
                        }
                    }
                }
            }
            const interactiveMessage = await message.channel.send(mainObject(possibleActions));
            const mainCollector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            for (let i = 0; i < possibleActions.length; i++) {
                await interactiveMessage.react(numberReactions[i]);
            }
            await interactiveMessage.react('✅');
            await interactiveMessage.react('❌');
            let timeout = setTimeout(function() {
                mainCollector.stop('timeout');
            }, 120000);
            mainCollector.on('collect', async(r) => { //-------------------------On collect----------------------------
                clearTimeout(timeout); //Reset the timeout
                if (r.emoji.name === numberReactions[0]) { //1 - Reset permissions
                    guildEntry.permissions.users = [];
                    guildEntry.permissions.channels = [];
                    guildEntry.permissions.roles = [];
                    guildEntry.permissions.global.allowedCommands = ['generic*', 'fun*', 'misc*', 'utility*', 'image*'];
                    guildEntry.permissions.global.restrictedCommands = ['moderation*', 'settings*'];
                    possibleActions[0] = "Permissions have been reset";
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[1]) { //2 - Reset prefix
                    guildEntry.generalSettings.prefix = client.database.prefix;
                    possibleActions[1] = `Prefix has been set back to ${client.database.prefix}`;
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[2] && (message.guild.ownerID === message.author.id)) { //3 - Reset everything (if owner since you could actually break by reacting with 3)
                    guildEntry = client.defaultGuildData(message.guild.id);
                    possibleActions[2] = `Warning: Confirming will erase everything, including greetings, experience...`;
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === '✅') {
                    mainCollector.stop('confirmed');
                } else if (r.emoji.name === '❌') {
                    mainCollector.stop('aborted');
                }
                await r.remove(message.author.id); //Delete user reaction                   
                timeout = setTimeout(function() { //Restart the timeout
                    mainCollector.stop('timeout');
                }, 120000);
            });
            mainCollector.on('end', async(collected, reason) => {
                await interactiveMessage.clearReactions();
                if (reason === 'timeout') { //Timeout
                    await interactiveMessage.edit({
                        embed: {
                            description: ':x: Timeout, aborting the process...'
                        }
                    });
                    interactiveMessage.delete(5000);
                } else if (reason === 'confirmed') { //Confirm and save
                    client.guildData.set(message.guild.id, guildEntry);
                    await interactiveMessage.edit({
                        embed: {
                            description: ':white_check_mark: Changes saved'
                        }
                    });
                    interactiveMessage.delete(5000);
                } else if (reason === 'aborted') {
                    await interactiveMessage.delete();
                }
                resolve(true);
            });
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}
exports.conf = {
    disabled: false,
    aliases: [],
    guildOnly: true
}
exports.help = {
    name: 'settings',
    description: 'The dangerous panel with a lot of red buttons, used to reset the permissions or even all the data of this guild',
    usage: 'settings',
    category: 'moderation'
}
exports.shortcut = {
    triggers: new Map([
        ['reset_prefix', {
            script: 'resetPrefix.js',
            help: `Reset the prefix to the default prefix`
        }],
        ['reset_permissions', {
            script: 'resetPermissions.js',
            help: `Reset the permissions to the default ones`
        }],
        ['reset_everything', {
            script: 'resetEverything.js',
            help: `Wipe out all your guild-related data, that includes prefix, levels, permissions...`
        }]
    ])
}