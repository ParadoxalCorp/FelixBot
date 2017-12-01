module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.onEvent.guildMemberAdd.onJoinRole = guildEntry.onEvent.guildMemberAdd.onJoinRole.filter(r => message.guild.roles.get(r)); //Filter deleted roles
            if (!guildEntry.onEvent.guildMemberAdd.onJoinRole[0]) return resolve(message.channel.createMessage(`:x: There is not any role set to be given to new members yet`));
            let rolesFields = [];
            guildEntry.onEvent.guildMemberAdd.onJoinRole.forEach(role => { //Build roles fields
                let guildRole = message.guild.roles.get(role);
                let mentionable = guildRole.mentionable ? `:white_check_mark:` : `:x:`
                hoisted = guildRole.hoist ? `:white_check_mark:` : `:x:`;
                rolesFields.push([{
                    name: 'Name',
                    value: `${guildRole.name}`,
                    inline: true
                }, {
                    name: 'HEX Color',
                    value: `#${guildRole.color}`,
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
            let page = 0;
            const listMessage = function(page) {
                return {
                    embed: {
                        title: ':gear: List of roles added to new members ',
                        description: `Use the arrows to navigate through the roles list`,
                        fields: rolesFields[page],
                        footer: {
                            text: `Showing page ${page + 1}/${rolesFields.length} | Time limit: 120 seconds`
                        },
                        color: parseInt(message.guild.roles.get(guildEntry.onEvent.guildMemberAdd.onJoinRole[page]).color)
                    }
                }
            }
            const sentListMessage = await message.channel.createMessage(listMessage(page));
            const reactions = ["◀", "▶", "❌"];
            for (let i = 0; i < reactions.length; i++) await sentListMessage.addReaction(reactions[i]);
            const collector = await sentListMessage.createReactionCollector((r) => r.user.id === message.author.id);
            client.on("messageDelete", m => { if (m.id === sentListMessage.id) return resolve(true) });
            let timeout = setTimeout(() => {
                collector.stop("timeout")
            }, 60000);
            collector.on("collect", async(r) => {
                sentListMessage.removeReaction(r.emoji.name, r.user.id);
                clearTimeout(timeout);
                if (r.emoji.name === "◀") {
                    if (page !== 0) page--;
                    sentListMessage.edit(listMessage(page));
                } else if (r.emoji.name === "▶") {
                    if (page !== (rolesFields.length - 1)) page++;
                    sentListMessage.edit(listMessage(page));
                } else if (r.emoji.name === "❌") {
                    collector.stop("aborted");
                }
                timeout = setTimeout(() => {
                    collector.stop("timeout");
                }, 60000)
            });
            collector.on("end", (collected, reason) => {
                sentListMessage.delete();
                resolve(true);
            });
        } catch (err) {
            reject(err);
        }
    });
}