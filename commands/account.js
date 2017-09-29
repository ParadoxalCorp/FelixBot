exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let userEntry = client.userData.get(message.author.id);
            let possibleActions = ['[1] - Global level & experience privacy: Public', '[2] - Profile privacy: Public', '[3] - Love points privacy: Public', '[4] - Points privacy: Public', '[5] - Upvote privacy: Public', '[5] - Reset global experience', '[6] - Reset all account data'];
            if (!userEntry.dataPrivacy.publicLevel) possibleActions[0] = '[1] - Global level & experience privacy: Private';
            if (!userEntry.dataPrivacy.publicProfile) possibleActions[1] = '[2] - Profile privacy: Private. Warning: Private means nobody can get your profile with the uinfo command';
            if (!userEntry.dataPrivacy.publicLove) possibleActions[2] = '[3] - Love points privacy: Private';
            if (!userEntry.dataPrivacy.publicPoints) possibleActions[3] = '[4] - Points privacy: Private';
            if (!userEntry.dataPrivacy.publicUpvote) possibleActions[4] = '[5] - Upvote privacy: Private';
            let numberReactions = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣"];
            let mainObject = function(actions) {
                return {
                    embed: {
                        title: ':gear: Account settings',
                        description: 'Edit the settings with the reactions, use :white_check_mark: to confirm the changes or :x: to abort\n```\n' + actions.join("\n\n") + '```',
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
                if (r.emoji.name === numberReactions[0]) { //1 - Change global experience privacy
                    if (userEntry.dataPrivacy.publicLevel) {
                        userEntry.dataPrivacy.publicLevel = false;
                        possibleActions[0] = '[1] - Global level & experience privacy: Private';
                    } else {
                        userEntry.dataPrivacy.publicLevel = true;
                        possibleActions[0] = '[1] - Global level & experience privacy: Public';
                    }
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[1]) { //2 - Change profile privacy
                    if (userEntry.dataPrivacy.publicProfile) {
                        userEntry.dataPrivacy.publicProfile = false;
                        possibleActions[1] = '[2] - Profile privacy: Private. Warning: Private means nobody can get your profile with the uinfo command';
                    } else {
                        userEntry.dataPrivacy.publicProfile = true;
                        possibleActions[1] = '[2] - Profile privacy: Public';
                    }
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[2]) { //3 - Change love privacy
                    if (userEntry.dataPrivacy.publicLove) {
                        userEntry.dataPrivacy.publicLove = false;
                        possibleActions[2] = '[3] - Love points privacy: Private';
                    } else {
                        userEntry.dataPrivacy.publicLove = true;
                        possibleActions[2] = '[3] - Love points privacy: Public';
                    }
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[3]) { //4 - Change points privacy
                    if (userEntry.dataPrivacy.publicPoints) {
                        userEntry.dataPrivacy.publicPoints = false;
                        possibleActions[3] = '[4] - Points privacy: Private';
                    } else {
                        userEntry.dataPrivacy.publicPoints = true;
                        possibleActions[3] = '[4] - Points privacy: Public';
                    }
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[4]) { //5 - Change points privacy
                    if (userEntry.dataPrivacy.publicUpvote) {
                        userEntry.dataPrivacy.publicUpvote = false;
                        possibleActions[4] = '[5] - Upvote privacy: Private';
                    } else {
                        userEntry.dataPrivacy.publicUpvote = true;
                        possibleActions[4] = '[5] - Upvote privacy: Public';
                    }
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[5]) { //Reset experience
                    userEntry.experience = client.defaultUserData(message.author.id).experience; //reset experience
                    possibleActions[4] = '[5] - Warning: Confirming will wipe out your global level and experience';
                    await interactiveMessage.edit(mainObject(possibleActions));
                } else if (r.emoji.name === numberReactions[6]) {
                    userEntry = client.defaultUserData(message.author.id);
                    possibleActions[5] = '[6] - Warning: Confirming will wipe out all your data, including your love points, points, experience...';
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
                    client.userData.set(message.author.id, userEntry);
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
    });
}
exports.conf = {
    guildOnly: false,
    disabled: false,
    aliases: []
}
exports.help = {
    name: 'account',
    usage: 'account',
    description: 'Enter your account settings, where you can reset your data or change some of your data privacy (only stuff related to Felix ofc)',
    category: 'generic',
}