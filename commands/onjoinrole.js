exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.onEvent.guildMemberAdd.onJoinRole = guildEntry.onEvent.guildMemberAdd.onJoinRole.filter(r => message.guild.roles.get(r)); //Filter deleted roles
            let modes = ['Navigation mode, you can enter the edition mode with :heavy_plus_sign:', 'Edition mode, you can write down the name of the role to add'];
            const mainObject = function(page, embedFields, mode) {
                return {
                    embed: {
                        title: ':gear: Roles added to new members settings',
                        description: `Use the arrows to navigate through the roles list, you can use :heavy_plus_sign: to start typing the name of a role to add or :wastebasket: to remove one, you can end this command at any moment with :x:.\nNote: You can't add more than 5 roles to the list\n\n**Mode:** ${mode}`,
                        fields: embedFields[page],
                        footer: {
                            text: `Showing page ${page + 1}/${guildEntry.onEvent.guildMemberAdd.onJoinRole.length} | Time limit: 120 seconds`
                        }
                    }
                }
            }
            let rolesFields = [];
            guildEntry.onEvent.guildMemberAdd.onJoinRole.forEach(function(role) { //Build roles fields
                let guildRole = message.guild.roles.get(role);
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
                }]);
            });
            const secondaryObject = function(mode) {
                return {
                    embed: {
                        title: ':gear: Roles added to new members settings',
                        description: `Use the arrows to navigate through the roles list, you can use :heavy_plus_sign: to start typing the name of a role to add or :wastebasket: to remove one, you can end this command at any moment with :x:.\nNote: You can't add more than 5 roles to the list\n\n**Mode:** ${mode}\n\nSeems like there is not any roles in the list yet, start by adding one with :heavy_plus_sign: !`,
                    }
                }
            }
            let page = 0; //current page
            var interactiveMessage;
            if (guildEntry.onEvent.guildMemberAdd.onJoinRole.length < 1) interactiveMessage = await message.channel.send(secondaryObject(modes[0]));
            else interactiveMessage = await message.channel.send(mainObject(page, rolesFields, modes[0]));
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            let pageReactions = ["⏮", "◀", "▶", "⏭", "➕", "🗑", "❌"];
            for (let i = 0; i < pageReactions.length; i++) {
                await interactiveMessage.react(pageReactions[i]);
            }
            var timeout = setTimeout(async function() {
                collector.stop("timeout");
            }, 120000);
            let isCollecting = false;
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //reset the timeout
                if (r.emoji.name === pageReactions[0]) { //Move to first page
                    if (page !== 0) { //Dont edit for nothing
                        page = 0;
                        await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                    }
                } else if (r.emoji.name === pageReactions[1]) { //Move to previous page
                    if (page === 0) {
                        page = rolesFields.length - 1;
                    } else {
                        page--;
                    }
                    await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                } else if (r.emoji.name === pageReactions[2]) { //Move to next page
                    if (page === rolesFields.length - 1) {
                        page = 0;
                    } else {
                        page++;
                    }
                    await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                } else if (r.emoji.name === pageReactions[3]) { //Move to last page
                    if (!page !== rolesFields.length - 1) { //Dont edit if already at last page
                        page = rolesFields.length - 1;
                        await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                    }
                } else if (r.emoji.name === pageReactions[4]) {
                    if (!isCollecting) {
                        if (guildEntry.onEvent.guildMemberAdd.onJoinRole.length < 1) await interactiveMessage.edit(secondaryObject(modes[1]));
                        else await interactiveMessage.edit(mainObject(page, rolesFields, modes[1]));
                        let isCollecting = true;
                        let role;
                        if (guildEntry.onEvent.guildMemberAdd.onJoinRole.length === 5) {
                            const maxRoles = await message.channel.send(":x: You can't add more than 5 roles, please remove one before adding another one");
                            maxRoles.delete(5000);
                        } else {
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
                                    if (guildEntry.onEvent.guildMemberAdd.onJoinRole.includes(guildRoles.first().id)) {
                                        let roleAlreadyIn = await message.channel.send(":x: This role is already in the list !");
                                        roleAlreadyIn.delete(5000);
                                    } else {
                                        guildEntry.onEvent.guildMemberAdd.onJoinRole.push(guildRoles.first().id);
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
                                        }]);
                                        page = rolesFields.length - 1;
                                        await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                                    }
                                }
                            }
                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) role.delete();
                            let isCollecting = false;
                        }
                    }
                } else if (r.emoji.name === pageReactions[5]) { //If deletion, delete
                    if (rolesFields.length > 0) {
                        rolesFields.splice(page, 1);
                        guildEntry.onEvent.guildMemberAdd.onJoinRole.splice(page, 1);
                        if (page !== 0) page--;
                        if (rolesFields.length > 0) await interactiveMessage.edit(mainObject(page, rolesFields, modes[0]));
                        else await interactiveMessage.edit(secondaryObject(modes[0]));
                    }
                } else if (r.emoji.name === pageReactions[6]) { //Abort the command
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
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
}

exports.conf = {
    disabled: false,
    permLevel: 2,
    aliases: [],
    guildOnly: true
}
exports.help = {
    name: 'onjoinrole',
    description: 'Set the role(s) that Felix will give to new members',
    usage: 'onjoinrole',
    category: 'settings'
}