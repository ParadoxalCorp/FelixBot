class Iam {
    constructor() {
        this.help = {
            name: 'iam',
            description: 'Add to yourself a self-assignable role',
            usage: 'iam [role_name]',
            detailedUsage: '`{prefix}iam` Will return the list of the self-assignables roles set on this server\n`{prefix}iam Neko` Will give you the self-assignable role `Neko`'
        }
        this.conf = {
            guildOnly: true,
            cooldownWeight: 4,
            requirePerms: ['manageRoles']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const paginateResult = require("../../util/modules/paginateResults");
                const guildEntry = client.guildData.get(message.guild.id);
                guildEntry.generalSettings.autoAssignablesRoles = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.get(r)); //Filter deleted roles
                if (args.length < 1) {
                    if (guildEntry.generalSettings.autoAssignablesRoles.length < 1) return resolve(await message.channel.createMessage(":x: There is no self-assignable role set on this server"));
                    let roleList = guildEntry.generalSettings.autoAssignablesRoles.map(r => message.guild.roles.get(r).name);
                    roleList = paginateResult(roleList, 5);
                    let page = 0;
                    let rolesFields = [];
                    guildEntry.generalSettings.autoAssignablesRoles.forEach(role => { //Build roles fields
                        let guildRole = message.guild.roles.get(role);
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
                            value: guildRole.hoist ? `:white_check_mark:` : `:x:`,
                            inline: true
                        }, {
                            name: 'Mentionable',
                            value: guildRole.mentionable ? `:white_check_mark:` : `:x:`,
                            inline: true
                        }]);
                    });
                    let listMessage = function(page, raw) {
                        return {
                            embed: {
                                title: "Self-assignable roles list",
                                description: "Here's the list of the self-assignable role, you can assign one to yourself with `" + guildEntry.generalSettings.prefix + "iam [role_name]`\n" + (raw ? "```\n" + roleList[page][0].join(`\n`) + "```" : ""),
                                footer: {
                                    text: `Showing page ${page + 1}/${raw ? roleList.length : rolesFields.length} | Time limit: 60 seconds`
                                },
                                fields: raw ? undefined : rolesFields[page],
                                color: raw ? 0x000 : parseInt(message.guild.roles.get(guildEntry.generalSettings.autoAssignablesRoles[page]).color)
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
                } else {
                    if (!message.guild.members.get(client.user.id).hasPermission("manageRoles")) return resolve(await message.channel.createMessage(":x: I don't have the permission to do that"));
                    let guildRole = await message.getRoleResolvable({
                        text: args.join(" "),
                        single: true,
                    });
                    if (!guildRole.first() || !guildEntry.generalSettings.autoAssignablesRoles.includes(guildRole.first().id)) return resolve(await message.channel.createMessage(":x: The specified role does not exist or it is not a self-assignable role"));
                    if (message.guild.members.get(message.author.id).roles.find(r => r === guildRole.first().id)) return resolve(await message.channel.createMessage(':x: You already have this role'));
                    await message.guild.members.get(message.author.id).addRole(guildRole.first().id);
                    resolve(await message.channel.createMessage(":white_check_mark: Alright, i gave you the role `" + guildRole.first().name + "`"));
                }
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Iam();