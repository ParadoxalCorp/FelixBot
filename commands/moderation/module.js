const paginate = require(`../../util/modules/paginateResults.js`);

class Module {
    constructor() {
        this.help = {
            name: 'module',
            description: `Allows you to disable/enable a whole command category/command, disabled modules will not appear in the help nor be usable unless the user has administrator permissions`,
            usage: `module -disable ping`,
            detailedUsage: '`{prefix}module -disable ping` Will disable the ping command\n`{prefix}module -disable misc*` Will disable the whole `misc` command category\nYou can use `-enable` instead of `-disable` to re-enable a module\n`{prefix}module -list` Will show the list of disabled modules'
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!message.guild.members.get(message.author.id).hasPermission("administrator")) return resolve(await message.channel.createMessage(`:x: You need to have administrator permissions to do that`));
                const guildEntry = client.guildData.get(message.guild.id);
                if (args[0] && args[0].toLowerCase() === "-list") {
                    if (!guildEntry.generalSettings.disabledModules[0]) {
                        return resolve(await message.channel.createMessage(`:x: There is no disabled modules`));
                    }
                    const paginated = paginate(guildEntry.generalSettings.disabledModules, 10);
                    let page = 0;
                    let listMessage = function(page) {
                        return {
                            embed: {
                                title: ":gear: Disabled modules list",
                                description: `Here's the list of the disabled modules \`\`\`\n${paginated[page].join('\n')}\`\`\``,
                                footer: {
                                    text: `Showing page ${page + 1}/${paginated.length} | Time limit: 60 seconds`
                                }
                            }
                        }
                    }
                    const sentListMessage = await message.channel.createMessage(listMessage(page));
                    const reactions = ["◀", "▶", "❌"];
                    for (let i = 0; i < reactions.length; i++) {
                        await sentListMessage.addReaction(reactions[i]);
                    }
                    const collector = await sentListMessage.createReactionCollector((r) => r.user.id === message.author.id);
                    let timeout = setTimeout(() => {
                        collector.stop("timeout");
                    }, 60000);
                    collector.on("collect", async(r) => {
                        sentListMessage.removeReaction(r.emoji.name, r.user.id);
                        clearTimeout(timeout);
                        if (r.emoji.name === "◀") {
                            page = page === 0 ? paginated.length - 1 : page--;
                            sentListMessage.edit(listMessage(page));
                        } else if (r.emoji.name === "▶") {
                            page = page === paginated.length - 1 ? 0 : page++;
                            sentListMessage.edit(listMessage(page));
                        } else if (r.emoji.name === "❌") {
                            collector.stop("aborted");
                        }
                        timeout = setTimeout(() => {
                            collector.stop("timeout");
                        }, 60000);
                    });
                    collector.on("end", () => {
                        sentListMessage.delete().catch();
                        return resolve(true);
                    });
                } else {
                    const disable = new RegExp(/-disable|-enable/gim).test(message.content);
                    let categories = [];
                    client.commands.forEach(c => {
                        if (!categories.includes(c.help.category)) {
                            categories.push(c.help.category);
                        }
                    });
                    const modules = args.filter(a => categories.includes(a.split("*")[0]) || client.commands.get(a) || client.commands.get(client.aliases.get(a)));
                    if (!modules[0]) {
                        return resolve(await message.channel.createMessage(`:x: You didn't specify a category or command to disable/enable`));
                    }
                    if (!disable) {
                        return resolve(await message.channel.createMessage(`:x: You must specify whether or not it should be disabled or enabled !`));
                    }
                    const toDisable = new RegExp(/-disable/gim).test(message.content);
                    let changedModules = [];
                    modules.forEach(m => {
                        if (toDisable && !guildEntry.generalSettings.disabledModules.find(modules => m === modules)) {
                            guildEntry.generalSettings.disabledModules.push(m);
                            changedModules.push(m);
                        } else if (!toDisable && guildEntry.generalSettings.disabledModules.find(modules => m === modules)) {
                            guildEntry.generalSettings.disabledModules.splice(guildEntry.generalSettings.disabledModules.findIndex(modules => m === modules), 1);
                            changedModules.push(m);
                        }
                    });
                    client.guildData.set(message.guild.id, guildEntry);
                    if (!changedModules[0]) {
                        return resolve(await message.channel.createMessage(`:x: The specified module(s) are already ${toDisable ? "disabled" : "enabled"}`));
                    }
                    resolve(await message.channel.createMessage(`:white_check_mark: Successfully ${toDisable ? "disabled" : "enabled"} \`${changedModules.join(", ")}\` (modules that were already ${toDisable ? "disabled" : "enabled"} aren't displayed)`));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Module();