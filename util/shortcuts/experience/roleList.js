module.exports = async(client, message, args) => {
    /**
     * Shortcut to display the list
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            if (guildEntry.generalSettings.levelSystem.roles.length === 0) return resolve(await message.channel.createMessage(`:x: There is not role set to be given at a specific point`));
            let page = 0;
            let rolesFields = [];
            guildEntry.generalSettings.levelSystem.roles.forEach(role => { //Build roles fields
                let guildRole = message.guild.roles.get(role.id);
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
                    value: `${guildRole.hoist ? ":white_check_mark:" : ":x:"}`,
                    inline: true
                }, {
                    name: 'Mentionable',
                    value: `${guildRole.mentionable ? ":white_check_mark:" : ":x:"}`,
                    inline: true
                }, {
                    name: 'At',
                    value: role.method === "message" ? `\`${role.at}\` messages` : `level \`${role.at}\``,
                    inline: true
                }]);
            });
            const listMessage = function(page) {
                return {
                    embed: {
                        title: ':notepad_spiral: Experience roles list',
                        description: `Use the arrows to navigate through the roles list`,
                        fields: rolesFields[page],
                        footer: {
                            text: `Showing page ${page + 1}/${guildEntry.generalSettings.levelSystem.roles.length} | Time limit: 120 seconds`
                        }
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