const paginateResult = require("../../modules/paginateResults");

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
            guildEntry.levelSystem.roles = guildEntry.levelSystem.roles.filter(r => message.guild.roles.get(r.id));
            if (guildEntry.levelSystem.roles.length === 0) return resolve(await message.channel.createMessage(`:x: There is not role set to be given at a specific point`));
            let roleList = guildEntry.levelSystem.roles.map(r => `${message.guild.roles.get(r.id).name} | At ${r.method === "message" ? r.at + " messages" : "level " + r.at}`);
            roleList = paginateResult(roleList, 5);
            let page = 0;
            let rolesFields = [];
            guildEntry.levelSystem.roles.forEach(role => { //Build roles fields
                let guildRole = message.guild.roles.get(role.id);
                rolesFields.push([{
                    name: 'Name',
                    value: `${guildRole.name}`,
                    inline: true
                }, {
                    name: 'HEX Color',
                    value: `#${guildRole.hexColor}`,
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
            let listMessage = function(page, raw) {
                return {
                    embed: {
                        title: "Experience system role list",
                        description: "Here's the list of the roles given at specific activity level (e.g: 100 messages, experience leve 10...)\n" + (raw ? "```\n" + roleList[page][0].join(`\n`) + "```" : ""),
                        footer: {
                            text: `Showing page ${page + 1}/${raw ? roleList.length : rolesFields.length} | Time limit: 60 seconds`
                        },
                        fields: raw ? undefined : rolesFields[page],
                        color: raw ? 0x000 : parseInt(message.guild.roles.get(guildEntry.levelSystem.roles[page].id).color)
                    }
                }
            }
            let raw = false;
            const sentListMessage = await message.channel.createMessage(listMessage(page));
            const reactions = ["◀", "▶", "🗒", "❌"];
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
                    page = page === 0 ? (raw ? roleList.length - 1 : rolesFields.length - 1) : page - 1;
                    sentListMessage.edit(listMessage(page, raw));
                } else if (r.emoji.name === "▶") {
                    page = page !== (raw ? roleList.length - 1 : rolesFields.length - 1) ? page + 1 : 0;
                    sentListMessage.edit(listMessage(page, raw));
                } else if (r.emoji.name === "🗒") {
                    raw = raw ? false : true;
                    page = 0;
                    sentListMessage.edit(listMessage(page, raw))
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