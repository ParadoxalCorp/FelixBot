module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            if (!Object.keys(guildEntry.moderation.warns.actions)[0]) {
                resolve(await message.channel.createMessage({
                    embed: {
                        title: `${message.guild.name}'s moderation settings`,
                        fields: [{
                            name: 'Automatic invite filtering',
                            value: guildEntry.moderation.inviteFiltering.enabled ? ':white_check_mark:' : ':x:',
                            inline: true
                        }, {
                            name: 'Warning for invites advertisement',
                            value: guildEntry.moderation.inviteFiltering.warn ? ':white_check_mark:' : ':x:'
                        }, {
                            name: 'White-listed guilds from invite filtering',
                            value: guildEntry.moderation.inviteFiltering.whitelistedGuilds[0] ? '```\n' + guildEntry.moderation.inviteFiltering.whitelistedGuilds.map(g =>
                                (client.guilds.has(g) ? client.guilds.get(g).name + ` (${g})` : g)) + '```' : ':x:'
                        }, {
                            name: 'Advertisement warn message',
                            value: guildEntry.moderation.inviteFiltering.warnMessage ? '```\n' + guildEntry.moderation.inviteFiltering.warnMessage + '```' : ':x:'
                        }, {
                            name: 'Custom muted roles',
                            value: guildEntry.moderation.mutedRoles.filter(r => message.guild.roles.has(r.id))[0] ? '```\n' + guildEntry.moderation.mutedRoles.filter(r =>
                                message.guild.roles.has(r.id)).map(r => `${message.guild.roles.get(r.id).name} | as '${(r.name 
                                ? r.name.replace(/%ROLE%/gim, message.guild.roles.get(r.id).name) 
                                : message.guild.roles.get(r.id).name)}'`).join('\n') + '```' : ':x:'
                        }]
                    }
                }));
            }
            await message.channel.createMessage({
                embed: {
                    title: `${message.guild.name}'s moderation settings`,
                    fields: [{
                        name: 'Automatic invite filtering',
                        value: guildEntry.moderation.inviteFiltering.enabled ? ':white_check_mark:' : ':x:',
                        inline: true
                    }, {
                        name: 'Warning for invites advertisement',
                        value: guildEntry.moderation.inviteFiltering.warn ? ':white_check_mark:' : ':x:'
                    }, {
                        name: 'White-listed guilds from invite filtering',
                        value: guildEntry.moderation.inviteFiltering.whitelistedGuilds[0] ? '```\n' + guildEntry.moderation.inviteFiltering.whitelistedGuilds.map(g =>
                            (client.guilds.has(g) ? client.guilds.get(g).name + ` (${g})` : g)) + '```' : ':x:'
                    }, {
                        name: 'Advertisement warn message',
                        value: guildEntry.moderation.inviteFiltering.warnMessage ? '```\n' + guildEntry.moderation.inviteFiltering.warnMessage + '```' : ':x:'
                    }, {
                        name: 'Custom muted roles',
                        value: guildEntry.moderation.mutedRoles.filter(r => message.guild.roles.has(r.id))[0] ? '```\n' + guildEntry.moderation.mutedRoles.filter(r =>
                            message.guild.roles.has(r.id)).map(r => `${message.guild.roles.get(r.id).name} | as '${(r.name 
                            ? r.name.replace(/%ROLE%/gim, message.guild.roles.get(r.id).name) 
                            : message.guild.roles.get(r.id).name)}`).join('\n') + '\'```' : ':x:'
                    }]
                }
            });
            const messageStructure = function(warnActionCount) {
                const warnAction = guildEntry.moderation.warns.actions[warnActionCount];
                return {
                    embed: {
                        title: 'Actions set to be taken at specific warn counts',
                        fields: [{
                            name: 'At',
                            value: `${warnActionCount} warns`,
                            inline: true
                        }, {
                            name: 'Action',
                            value: warnAction.action === "mute" && warnAction.customMutedRole ? (message.guild.roles.has(warnAction.customMutedRole) ? (guildEntry.moderation.mutedRoles.find(m => m.id === warnAction.customMutedRole).name ? guildEntry.moderation.mutedRoles.find(m => m.id === warnAction.customMutedRole).name.replace(/%ROLE%/gim, message.guild.roles.get(warnAction.customMutedRole).name) : message.guild.roles.get(warnAction.customMutedRole).name) : ':x: (Deleted custom mute role)') : warnAction.action,
                            inline: true
                        }, {
                            name: 'Message',
                            value: warnAction.message ? '```' + warnAction.message + '```' : ':x:'
                        }],
                        color: 0xff9933
                    }
                }
            }
            const reactions = ["◀", "▶", "🗑", "❌"];
            const actionsCount = Object.keys(guildEntry.moderation.warns.actions);
            let currentAction = 0; //Keep track of where we are in the array
            const interactiveMessage = await message.channel.createMessage(messageStructure(actionsCount[currentAction]));
            const collector = await interactiveMessage.createReactionCollector(reaction => reaction.user.id === message.author.id);
            for (let i = 0; i < reactions.length; i++) await interactiveMessage.addReaction(reactions[i]);
            let timeout = setTimeout(function() {
                collector.stop('timeout');
            }, 120000);
            collector.on('collect', async(r) => {
                clearTimeout(timeout);
                interactiveMessage.removeReaction(r.emoji.name, r.user.id);
                if (r.emoji.name === "◀") {
                    currentAction = currentAction === 0 ? actionsCount.length - 1 : currentAction - 1;
                    await interactiveMessage.edit(messageStructure(actionsCount[currentAction]));
                } else if (r.emoji.name === "▶") {
                    currentAction = currentAction === actionsCount.length - 1 ? 0 : currentAction + 1;
                    await interactiveMessage.edit(messageStructure(actionsCount[currentAction]));
                } else if (r.emoji.name === "🗑") {
                    delete guildEntry.moderation.warns.actions[actionsCount[currentAction]];
                    client.guildData.set(message.guild.id, guildEntry);
                    actionsCount.splice(currentAction, 1);
                    currentAction = 0;
                    if (!actionsCount[currentAction]) collector.stop('No more warns actions');
                    else await interactiveMessage.edit(messageStructure(actionsCount[currentAction]));
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