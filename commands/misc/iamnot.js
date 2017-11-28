class Iamnot {
    constructor() {
        this.help = {
            name: 'iamnot',
            description: 'Remove from yourself a self-assignable role',
            usage: 'iamnot [role_name]',
            detailedUsage: '`{prefix}iamnot` Will return the list of the self-assignables roles set on this server\n`{prefix}iamnot Neko` Will remove from you the self-assignable role `Neko`'
        }
        this.conf = {
            guildOnly: true,
            cooldownWeight: 4
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const paginateResult = require("../../util/modules/paginateResults");
                const guildEntry = client.guildData.get(message.guild.id);
                guildEntry.generalSettings.autoAssignablesRoles = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.get(r)); //Filter deleted roles
                if (args.length < 1) {
                    if (guildEntry.generalSettings.autoAssignablesRoles.length < 1) return resolve(await message.channel.send(":x: There is no self-assignable role set on this server"));
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
                } else {
                    if (!message.guild.members.get(client.user.id).hasPermission("manageRoles")) return resolve(await message.channel.send(":x: I don't have the permission to do that"));
                    let guildRole = message.guild.roles.find(r => r.name === args.join(" "));
                    if (!guildRole || !guildEntry.generalSettings.autoAssignablesRoles.includes(guildRole.id)) return resolve(await message.channel.send(":x: The specified role does not exist or it is not a self-assignable role"));
                    if (!message.guild.members.get(message.author.id).roles.find(r => r === guildRole.id)) return resolve(await message.channel.send(`:x: You don't have this role so i can't really remove it :v`));
                    await message.guild.members.get(message.author.id).removeRole(guildRole.id);
                    resolve(await message.channel.send(":white_check_mark: Alright, i removed from you the role `" + guildRole.name + "`"));
                }
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Iamnot();