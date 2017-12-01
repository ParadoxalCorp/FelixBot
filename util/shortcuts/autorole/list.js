const paginateResult = require("../../modules/paginateResults");

module.exports = async(client, message, args) => {
    /**
     * Shortcut to get the list of self-assignable roles
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            guildEntry.generalSettings.autoAssignablesRoles = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.get(r)); //Filter deleted roles
            if (guildEntry.generalSettings.autoAssignablesRoles.length < 1) return resolve(await message.channel.createMessage(":x: There is no self-assignable role set on this server"));
            let roleList = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.has(r)).map(r => message.guild.roles.get(r).name);
            roleList = paginateResult(roleList, 5);
            let page = 0;
            let listMessage = function(page) {
                return {
                    embed: {
                        title: "Self-assignable roles list",
                        description: `Here's the list of the self-assignable role, you can assign one to yourself with \`${guildEntry.generalSettings.prefix}iam [role_name]\` \`\`\`\n${roleList[page].join('\n')}\`\`\``,
                        footer: {
                            text: `Showing page ${page + 1}/${roleList.length} | Time limit: 60 seconds`
                        },
                        color: parseInt(message.guild.roles.get(guildEntry.generalSettings.autoAssignablesRoles[page]).color)
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
                    if (page !== (roleList.length - 1)) page++;
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