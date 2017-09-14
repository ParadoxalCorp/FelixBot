exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            let args = message.content.split(/\s+/gim);
            args.shift();
            if (args[0] === "rolelist") {
                guildEntry.generalSettings.levelSystem.roles = guildEntry.generalSettings.levelSystem.roles.filter(r => message.guild.roles.get(r.id)); //Filter deleted roles
                let modes = ['Navigation mode, you can enter the edition mode with :heavy_plus_sign:', 'Edition mode, you can write down the name of the role to add'];
                const mainObject = function(page, embedFields, mode) {
                    return {
                        embed: {
                            title: ':gear: Self-assignables roles settings',
                            description: `Use the arrows to navigate through the roles list, you can use :heavy_plus_sign: to start typing the name of a role to add or :wastebasket: to remove one, you can end this command at any moment with :x:.\n**Note:** The upward and downward arrows are a quick way to change the level of the current role\n\n**Mode:** ${mode}`,
                            fields: embedFields[page],
                            footer: {
                                text: `Showing page ${page + 1}/${guildEntry.generalSettings.levelSystem.roles.length} | Time limit: 120 seconds`
                            }
                        }
                    }
                }
                let rolesFields = [];
                guildEntry.generalSettings.levelSystem.roles.forEach(function(role) { //Build roles fields
                    let guildRole = message.guild.roles.get(role.id);
                    let mentionable = ':x:',
                        hoisted = ':x:';
                    if (guildRole.mentionable) mentionable = ':white_check_mark:';
                    if (guildRole.hoist) hoisted = ':white_check_mark:';
                    rolesFields.push([{
                        name: 'Name',
                        value: `${guildRole.name}`,
                        inline: true
                    }, {
                        name: 'HEX Color',
                        value: `${guildRole.hexColor}`,
                        inline: true
                    }, {
                        name: `Hoisted`,
                        value: `${hoisted}`,
                        inline: true
                    }, {
                        name: 'Mentionable',
                        value: `${mentionable}`,
                        inline: true
                    }, {
                        name: 'At level',
                        value: `${role.atLevel}`,
                        inline: true
                    }]);
                });
                const secondaryObject = function(mode) {
                    return {
                        embed: {
                            title: ':gear: Roles given on level up settings',
                            description: `Use the arrows to navigate through the roles list, you can use :heavy_plus_sign: to start typing the name of a role to add or :wastebasket: to remove one, You can end this command at any moment with :x:.\n\n**Mode:** ${mode}\n\nSeems like there is not any roles in the list yet, start by adding one with :heavy_plus_sign: !`,
                        }
                    }
                }
                let page = 0; //current page
                let interactiveMessage;
                if (guildEntry.generalSettings.levelSystem.roles.length < 1) interactiveMessage = await message.channel.send(secondaryObject(modes[0]));
                else interactiveMessage = await message.channel.send(mainObject(page, rolesFields, modes[0]));
                const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
                let pageReactions = ["⏮", "◀", "▶", "⏭", "🔼", "🔽", "➕", "🗑", "❌"];
                for (let i = 0; i < pageReactions.length; i++) {
                    await interactiveMessage.react(pageReactions[i]);
                }
                var timeout = setTimeout(async function() {
                    collector.stop("timeout");
                }, 120000);
                collector.on('collect', async(r) => {
                    clearTimeout(timeout); //reset the timeout
                    if (r.emoji.name === pageReactions[0]) { //Move to first page---------------------------------------------------------------------------------------------------
                        if (page !== 0) { //Dont edit for nothing
                            page = 0;
                            await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                        }
                    } else if (r.emoji.name === pageReactions[1]) { //Move to previous page-----------------------------------------------------------------------------------------
                        if (page === 0) {
                            page = rolesFields.length - 1;
                        } else {
                            page--;
                        }
                        await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                    } else if (r.emoji.name === pageReactions[2]) { //Move to next page--------------------------------------------------------------------------------------------
                        if (page === rolesFields.length - 1) {
                            page = 0;
                        } else {
                            page++;
                        }
                        await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                    } else if (r.emoji.name === pageReactions[3]) { //Move to last page---------------------------------------------------------------------------------------------
                        if (!page !== rolesFields.length - 1) { //Dont edit if already at last page
                            page = rolesFields.length - 1;
                            await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                        }
                    } else if (r.emoji.name === pageReactions[4]) { //+ 1 level-----------------------------------------------------------------------------------------------------
                        if (guildEntry.generalSettings.levelSystem.roles.length > 0) {
                            guildEntry.generalSettings.levelSystem.roles[page].atLevel++;
                            rolesFields[page][4].value = guildEntry.generalSettings.levelSystem.roles[page].atLevel;
                            await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                        }
                    } else if (r.emoji.name === pageReactions[5]) { //+1 level------------------------------------------------------------------------------------------------------
                        if (guildEntry.generalSettings.levelSystem.roles.length > 0) {
                            guildEntry.generalSettings.levelSystem.roles[page].atLevel--;
                            rolesFields[page][4].value = guildEntry.generalSettings.levelSystem.roles[page].atLevel;
                            await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                        }
                    } else if (r.emoji.name === pageReactions[6]) { //Add a new role------------------------------------------------------------------------------------------------
                        if (guildEntry.generalSettings.levelSystem.roles.length < 1) await interactiveMessage.edit(secondaryObject(modes[1]));
                        else await interactiveMessage.edit(mainObject(page, rolesFields, modes[1]));
                        var role;
                        try {
                            const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                time: 120000,
                                errors: ["time"]
                            });
                            role = collected.first();
                        } catch (e) {
                            collector.stop('timeout');
                        }
                        if (role) {
                            const guildRoles = await client.getRoleResolvable(role, {
                                charLimit: 1
                            });
                            if (guildRoles.size < 1) {
                                let noRoleFound = await message.channel.send(`:x: I couldn't find the role you specified`);
                                noRoleFound.delete(5000);
                            } else {
                                if (guildEntry.generalSettings.levelSystem.roles.findIndex(function(storedRole) {
                                        return storedRole.id === guildRoles.first().id;
                                    }) !== -1) {
                                    let roleAlreadyIn = await message.channel.send(":x: This role is already in the list !");
                                    roleAlreadyIn.delete(5000);
                                } else {
                                    let atLevel;
                                    let insertLevelNotif = await message.channel.send({
                                        embed: {
                                            description: 'You can now enter the experience level at which i should give this role'
                                        }
                                    });
                                    try {
                                        const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                            max: 1,
                                            time: 120000,
                                            errors: ["time"]
                                        });
                                        atLevel = collected.first().content;
                                        insertLevelNotif.delete();
                                        if (message.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) collected.first().delete();
                                    } catch (e) {
                                        collector.stop('timeout');
                                    }
                                    if (isNaN(atLevel)) atLevel = 1;
                                    guildEntry.generalSettings.levelSystem.roles.push({
                                        id: guildRoles.first().id,
                                        atLevel: Math.round(atLevel)
                                    });
                                    let guildRole = message.guild.roles.get(guildRoles.first().id);
                                    let mentionable = ':x:',
                                        hoisted = ':x:';
                                    if (guildRole.mentionable) mentionable = ':white_check_mark:';
                                    if (guildRole.hoist) hoisted = ':white_check_mark:';
                                    rolesFields.push([{
                                        name: 'Name',
                                        value: `${guildRole.name}`,
                                        inline: true
                                    }, {
                                        name: 'HEX Color',
                                        value: `${guildRole.hexColor}`,
                                        inline: true
                                    }, {
                                        name: `Hoisted`,
                                        value: `${hoisted}`,
                                        inline: true
                                    }, {
                                        name: 'Mentionable',
                                        value: `${mentionable}`,
                                        inline: true
                                    }, {
                                        name: `At level`,
                                        value: `${Math.round(atLevel)}`
                                    }]);
                                    page = rolesFields.length - 1;
                                    await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                                }
                            }
                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) role.delete();
                        }
                    } else if (r.emoji.name === pageReactions[7]) { //If deletion, delete-----------------------------------------------------------------------------------
                        if (rolesFields.length > 0) {
                            rolesFields.splice(page, 1);
                            guildEntry.generalSettings.levelSystem.roles.splice(page, 1);
                            if (page !== 0) page--;
                            if (rolesFields.length > 0) await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                            else await interactiveMessage.edit(secondaryObject(modes[0]));
                        }
                    } else if (r.emoji.name === pageReactions[8]) { //Abort the command-------------------------------------------------------------------------------------
                        collector.stop("aborted"); //End the collector
                    }
                    await r.remove(message.author.id); //Delete user reaction
                    timeout = setTimeout(async function() {
                        collector.stop("timeout");
                    }, 120000); //Restart the timeout
                });
                collector.on('end', async(collected, reason) => { //-------------------------------------------------------------On collector end-------------------------------------
                    client.guildData.set(message.guild.id, guildEntry);
                    await interactiveMessage.delete();
                });
            } else {
                let possibleActions = ['[1] - Enabled: Disabled', '[2] - Privacy: Private', '[3] - Level up notifications: Disabled', '[4] - Reset experience of specified users', '[5] - Reset experience of everyone'];
                if (guildEntry.generalSettings.levelSystem.enabled) possibleActions[0] = '[1] - Enabled: Enabled';
                if (guildEntry.generalSettings.levelSystem.public) possibleActions[1] = '[2] - Privacy: Public';
                if (guildEntry.generalSettings.levelSystem.levelUpNotif === 'dm') possibleActions[2] = '[3] - Level up notifications: Direct message';
                else if (guildEntry.generalSettings.levelSystem.levelUpNotif === 'channel') possibleActions[2] = '[3] - Level up notifications: Channel';
                let numberReactions = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣"];
                let mainObject = function(actions) {
                    return {
                        embed: {
                            title: ':gear: Experience system settings',
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
                    if (r.emoji.name === numberReactions[0]) { //1 - Enable/disable the system
                        if (guildEntry.generalSettings.levelSystem.enabled) {
                            guildEntry.generalSettings.levelSystem.enabled = false;
                            possibleActions[0] = '[1] - Enabled: Disabled';
                        } else {
                            guildEntry.generalSettings.levelSystem.enabled = true;
                            possibleActions[0] = '[1] - Enabled: Enabled';
                        }
                        await interactiveMessage.edit(mainObject(possibleActions));
                    } else if (r.emoji.name === numberReactions[1]) { //2 - Change privacy
                        if (guildEntry.generalSettings.levelSystem.public) {
                            guildEntry.generalSettings.levelSystem.public = false;
                            possibleActions[1] = '[2] - Privacy: Private';
                        } else {
                            guildEntry.generalSettings.levelSystem.public = true;
                            possibleActions[1] = '[2] - Privacy: Public';
                        }
                        await interactiveMessage.edit(mainObject(possibleActions));
                    } else if (r.emoji.name === numberReactions[2]) { //3 - Change level up notifications methods
                        if (!guildEntry.generalSettings.levelSystem.levelUpNotif) { //If disabled switch to dm
                            guildEntry.generalSettings.levelSystem.levelUpNotif = 'dm';
                            possibleActions[2] = '[3] - Level up notifications: Direct message';
                        } else if (guildEntry.generalSettings.levelSystem.levelUpNotif === 'dm') { //If dm switch to channel
                            guildEntry.generalSettings.levelSystem.levelUpNotif = 'channel';
                            possibleActions[2] = '[3] - Level up notifications: Channel';
                        } else if (guildEntry.generalSettings.levelSystem.levelUpNotif === 'channel') { //Finally if channel switch to disabled
                            guildEntry.generalSettings.levelSystem.levelUpNotif = false;
                            possibleActions[2] = '[3] - Level up notifications: Disabled';
                        }
                        await interactiveMessage.edit(mainObject(possibleActions));
                    } else if (r.emoji.name === numberReactions[3]) {
                        let notifMessage = await message.channel.send({
                            embed: {
                                description: 'You can start writing the users, note that you need to confirm the changes or the reset wont work'
                            }
                        });
                        let usersToReset;
                        try {
                            const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                time: 120000,
                                errors: ["time"]
                            });
                            usersToReset = await client.getUserResolvable(collected.first(), {
                                guildOnly: true
                            });
                            if (message.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) collected.first().delete();
                        } catch (e) {
                            mainCollector.stop('timeout');
                        }
                        if (usersToReset.size > 0) {
                            for (let i = 0; i < guildEntry.generalSettings.levelSystem.users.length; i++) {
                                if (usersToReset.has(guildEntry.generalSettings.levelSystem.users[i].id)) {
                                    guildEntry.generalSettings.levelSystem.users[i].expCount = 0;
                                    guildEntry.generalSettings.levelSystem.users[i].level = 0;
                                }
                            }
                            await notifMessage.edit({
                                embed: {
                                    description: `:white_check_mark: The experience of ${usersToReset.map(u => '**' + u.tag + '**').join(', ')} has been reset`
                                }
                            });
                            notifMessage.delete(5000);
                        } else {
                            await notifMessage.edit({
                                embed: {
                                    description: `:x: No users found`
                                }
                            });
                            notifMessage.delete(5000);
                        }
                    } else if (r.emoji.name === numberReactions[4]) {
                        guildEntry.generalSettings.levelSystem.users = [];
                        possibleActions[4] = '[5] - Warning: Confirming will wipe out the experience of all members';
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
            }
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}

exports.conf = {
    guildOnly: false,
    disabled: false,
    permLevel: 2,
    aliases: ['exp']
}
exports.help = {
    name: 'experience',
    usage: 'experience',
    description: 'Enter the activity experience system settings of this server, this allow you to do stuff like disable level up notifications for example',
    category: 'settings',
    detailledUsage: '`{prefix}experience rolelist` Will return a list of all roles sets to be given on level up in which you can add and remove some'
}