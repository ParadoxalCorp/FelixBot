const Discord = require('discord.js');
module.exports = async(client) => {
    /**
     * @param {message} message The message that triggered the command
     * @param {Object} options The options
     * @param {number} options.charLimit - Defines the length required for an argument to be included in the search, default is 3
     * @param {boolean} options.shift - Whether or not the first element should be removed, usually to dont include the prefix and make the search faster, default is false
     */
    function getRoleResolvable(message, options) {
        return new Promise(async(resolve, rejecy) => {
            let args = message.content.split(/\s+/gim);
            if (options.shift) {
                args.shift(); //Remove prefix + command
            }
            const resolvedRoles = new Discord.Collection();
            var matchedByPartial = false;
            for (let i = 0; i < args.length; i++) {
                //------------------Resolve by ID--------------------
                if (args[i].length >= (options.charLimit || 3)) { //(dont try to resolve too small stuff)
                    if (!isNaN(args[i])) {
                        if (message.guild.roles.get(args[i])) {
                            resolvedRoles.set(args[i], message.guild.roles.get(args[i]));
                        }
                    }
                    //------------------Resolve by whole name--------------
                    let filterByWholeName = message.guild.roles.filter(g => g.name === args[i]);
                    if (filterByWholeName.size > 0) {
                        resolvedRoles.set(filterByWholeName.first().id, filterByWholeName.first());
                    } else {
                        //-----------------Resolve by case-insensitive name-----------------------------------
                        let filterRoles = message.guild.roles.filter(g => g.name.toLowerCase() === args[i].toLowerCase());
                        if (filterRoles.size > 0) {
                            if (filterRoles.size > 1) {
                                let filteredArray = Array.from(filterRoles.values());
                                let c = 1;
                                let selectedRole = await client.awaitReply({
                                    message: message,
                                    limit: 30000,
                                    title: ":mag: Roles search",
                                    question: "Multiple roles found, select one by typing a number ```\n" + filteredArray.map(r => `[${c++}] ${r.name}`).join("\n") + "```"
                                });
                                if (selectedRole && !isNaN(selectedRole.reply.content) && selectedRole.reply.content <= filteredArray.length && selectedRole.reply.content >= 1) {
                                    resolvedRoles.set(filteredArray[selectedRole.reply.content - 1].id, filteredArray[selectedRole.reply.content - 1]);
                                }
                                await selectedRole.question.delete();
                                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await selectedRole.reply.delete();
                            } else {
                                resolvedRoles.set(filterRoles.first().id, filterRoles.first());
                            }
                        } else {
                            //----------------Resolve by partial case-insensitive name-------------------------
                            let filterByPartial = message.guild.roles.filter(g => g.name.toLowerCase().includes(args[i].toLowerCase()));
                            if (filterByPartial.size > 0) {
                                let roleObject = filterByPartial.first();
                                if (!matchedByPartial || !matchedByPartial.name.toLowerCase().includes(roleObject.name)) {
                                    if (filterByPartial.size > 1) {
                                        let filteredArray = Array.from(filterByPartial.values());
                                        let c = 1;
                                        const selectedRole = await client.awaitReply({
                                            message: message,
                                            limit: 30000,
                                            title: ":mag: Roles search",
                                            question: "Multiple Roles found, select one by typing a number ```\n" + filteredArray.map(r => `[${c++}] ${r.name}`).join("\n") + "```"
                                        });
                                        if (!selectedRole.reply || isNaN(selectedRole.reply.content) || selectedRole.reply.content > filteredArray.length || selectedRole.reply.content < 1) {
                                            await selectedRole.question.delete();
                                            if (selectedRole.reply && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                                await selectedRole.reply.delete();
                                            }
                                        } else {
                                            roleObject = filteredArray[selectedRole.reply.content - 1];
                                            await selectedRole.question.delete();
                                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await selectedRole.reply.delete();

                                        }
                                    }
                                }
                                matchedByPartial = roleObject;
                                resolvedRoles.set(roleObject.id, roleObject);
                            }
                        }
                    }
                }
            }
            resolve(resolvedRoles);
        });
    }
    client.getRoleResolvable = getRoleResolvable;
}