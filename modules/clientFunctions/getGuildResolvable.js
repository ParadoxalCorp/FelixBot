const Discord = require('discord.js');
module.exports = async(client) => {
    /**
     * @param {message} message The message that triggered the command
     * @param {Object} options The options
     */
    function getGuildResolvable(message, options) {
        return new Promise(async(resolve, rejecy) => {
            let args = message.content.split(/\s+/gim);
            args.shift(); //Remove prefix + command
            const resolvedGuilds = new Discord.Collection();
            var matchedByPartial = false;
            for (let i = 0; i < args.length; i++) {
                //------------------Resolve by ID--------------------
                if (args[i].length >= 3) { //(dont try to resolve too small stuff)
                    if (!isNaN(args[i])) {
                        if (client.guilds.get(args[i])) {
                            resolvedGuilds.set(client.guilds.get(args[i]).id, client.guilds.get(args[i]));
                        }
                    }
                    //------------------Resolve by whole name--------------
                    let filterByWholeName = client.guilds.filter(g => g.name === args[i]);
                    if (filterByWholeName.size > 0) {
                        resolvedGuilds.set(filterByWholeName.first().id, filterByWholeName.first());
                    } else {
                        //-----------------Resolve by case-insensitive name-----------------------------------
                        let filterGuilds = client.guilds.filter(g => g.name.toLowerCase() === args[i].toLowerCase());
                        if (filterGuilds.size > 0) {
                            resolvedGuilds.set(filterGuilds.first().id, filterGuilds.first());
                        } else {
                            //----------------Resolve by partial case-insensitive name-------------------------
                            let filterByPartial = client.guilds.filter(g => g.name.toLowerCase().includes(args[i].toLowerCase()));
                            if (filterByPartial.size > 0) {
                                let guildObject = filterByPartial.first();
                                if (!matchedByPartial || !matchedByPartial.name.toLowerCase().includes(guildObject.name)) {
                                    if (filterByPartial.size > 1) {
                                        let filteredArray = Array.from(filterByPartial.values());
                                        let c = 1;
                                        const selectedGuild = await client.awaitReply({
                                            message: message,
                                            limit: 30000,
                                            title: ":mag: Guilds search",
                                            question: "Multiple guilds found, select one by typing a number ```\n" + filteredArray.map(u => `[${c++}] ${u.name}`).join("\n") + "```"
                                        });
                                        if (!selectedGuild.reply || isNaN(selectedGuild.reply.content) || selectedGuild.reply.content > filteredArray.length || selectedGuild.reply.content < 1) {
                                            await selectedGuild.question.delete();
                                            if (selectedGuild.reply && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                                await selectedGuild.reply.delete();
                                            }
                                        } else {
                                            guildObject = filteredArray[selectedGuild.reply.content - 1];
                                            await selectedGuild.question.delete();
                                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                                await selectedGuild.reply.delete();
                                            }
                                        }
                                    }
                                }
                                matchedByPartial = guildObject;
                                resolvedGuilds.set(guildObject.id, guildObject);
                            }
                        }
                    }
                }
            }
            resolve(resolvedGuilds);
        });
    }
    client.getGuildResolvable = getGuildResolvable;
}