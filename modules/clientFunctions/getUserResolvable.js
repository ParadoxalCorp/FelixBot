const Discord = require("discord.js");
module.exports = async(client, message) => {
    /**
     * Get the users resolvable of a message.
     * @param {Object} [message] The message object in which the search should be executed
     * @param {Object} [options] The options to provide
     * @param {Number} [options.charLimit] The needed characters for a word to be considered as user resolvable
     * @param {boolean} [options.guildOnly] Whether or not the resolve attempt should be limited to the guild members
     * @param {boolean} [options.shift] Whether or not the first word should be removed
     * @returns {Promise<Collection<id, User>>}
     * @example
     * // Get the users of a message
     * message.getUserResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} users`))
     *   .catch(console.error);
     */
    function getUserResolvable(message, options) {
        return new Promise(async(resolve, reject) => {
            if (!message.content) {
                return reject("The message content must be provided !");
            }
            if (!options) var options = {
                guildOnly: true
            };
            let potentialUserResolvables = message.content.split(/\s+/gim).filter(c => c.length >= (options.charLimit || 3));
            if (options.shift) potentialUserResolvables.shift();
            const usersResolved = new Discord.Collection();
            let matchedByPartial = false;
            if (options.guildOnly) { //Only the provided guild members
                for (let i = 0; i < potentialUserResolvables.length; i++) {
                    //------------------Resolve by ID--------------------
                    if (!isNaN(potentialUserResolvables[i]) && message.guild.members.get(potentialUserResolvables[i])) usersResolved.set(message.guild.members.get(potentialUserResolvables[i]), message.guild.members.get(potentialUserResolvables[i]).user);
                    //------------------Resolve by whole name--------------
                    let filterByWholeName = message.guild.members.filter(u => u.user.username === potentialUserResolvables[i]);
                    if (filterByWholeName.size > 0) usersResolved.set(filterByWholeName.first().id, filterByWholeName.first().user);
                    else { //-----------------Resolve by case-insensitive name or nickname-----------------------------------
                        let filterUsers = message.guild.members.filter(u => u.user.username.toLowerCase() === potentialUserResolvables[i].toLowerCase() || (u.nickname && u.nickname.toLowerCase() === potentialUserResolvables[i].toLowerCase()));
                        if (filterUsers.size > 1) {
                            let i = 1;
                            filterUsers = Array.from(filterUsers.values());
                            const selectedUser = await client.awaitReply({
                                message: message,
                                limit: 30000,
                                title: ":mag: User search",
                                question: "Multiple users found, select one by typing a number ```\n" + filterUsers.map(u => `[${i++}] ${u.user.tag}`).join("\n") + "```"
                            });
                            if (!selectedUser.reply || isNaN(selectedUser.reply.content) || Math.round(selectedUser.reply.content) > filterUsers.length || selectedUser.reply.content < 1) {
                                await selectedUser.question.delete();
                                if (selectedUser.reply && message.deletable) await selectedUser.reply.delete();
                            } else {
                                usersResolved.set(filterUsers[Math.round(selectedUser.reply.content - 1)].id, filterUsers[Math.round(selectedUser.reply.content - 1)].user);
                                await selectedUser.question.delete();
                                if (message.deletable) await selectedUser.reply.delete();
                            }
                        } else if (filterUsers.size === 1) usersResolved.set(filterUsers.first().id, filterUsers.first().user);
                        else {
                            //----------------Resolve by partial case-insensitive name or nickname-------------------------
                            let filterByPartial = message.guild.members.filter(u => u.user.username.toLowerCase().includes(potentialUserResolvables[i].toLowerCase()) || (u.nickname && u.nickname.toLowerCase().includes(potentialUserResolvables[i].toLowerCase()))).filter(m => !usersResolved.has(m.id));
                            if (filterByPartial.size > 0) {
                                let userObject = filterByPartial.first().user;
                                if (!matchedByPartial || !matchedByPartial.username.toLowerCase().includes(userObject.username)) {
                                    if (filterByPartial.size > 1) {
                                        let filteredArray = Array.from(filterByPartial.values());
                                        let c = 1;
                                        const selectedUser = await client.awaitReply({
                                            message: message,
                                            limit: 30000,
                                            title: ":mag: User search",
                                            question: "Multiple users found, select one by typing a number ```\n" + filteredArray.map(u => `[${c++}] ${u.user.tag}`).join("\n") + "```"
                                        });
                                        if (!selectedUser.reply || isNaN(selectedUser.reply.content) || Math.round(selectedUser.reply.content) > filteredArray.length || selectedUser.reply.content < 1) {
                                            await selectedUser.question.delete();
                                            if (selectedUser.reply && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await selectedUser.reply.delete();
                                        } else {
                                            userObject = filteredArray[Math.round(selectedUser.reply.content - 1)].user;
                                            await selectedUser.question.delete();
                                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await selectedUser.reply.delete();
                                        }
                                    }
                                }
                                matchedByPartial = userObject;
                                usersResolved.set(userObject.id, userObject);
                            }
                        }
                    }
                }
            } else {
                potentialUserResolvables.forEach(function(arg) { //All users cached 
                    //------------------Resolve by ID--------------------
                    if (!isNaN(arg)) {
                        if (client.users.get(arg)) {
                            return usersResolved.set(client.users.get(arg).id, client.users.get(arg));
                        }
                    }
                    //------------------Resolve by whole name--------------
                    if (client.users.find("name", arg)) {
                        return usersResolved.set(client.users.find("name", arg).id, client.users.find("name", arg));
                    }
                    //-----------------Resolve by case-insensitive name-----------------------------------
                    let filterUsers = client.users.filter(u => u.username.toLowerCase() === arg.toLowerCase());
                    if (filterUsers.size > 0) {
                        return usersResolved.set(filterUsers.first().id, filterUsers.first());
                    }
                    //----------------Resolve by partial name-------------------------
                    let filterByPartial = client.users.filter(u => u.username.includes(arg));
                    if (filterByPartial.size > 0) {
                        let userObject = filterByPartial.first();
                        if (matchedByPartial.username.includes(userObject.username)) {
                            return; //In case "Karen Kujou" with a space or something
                        }
                        matchedByPartial = userObject;
                        return usersResolved.set(userObject.id, userObject);
                    }
                });
            }
            //--------------Finally, resolve by mentions--------------------
            if (message.mentions.users.first()) message.mentions.users.forEach(m => usersResolved.set(m.id, m));
            resolve(usersResolved);
        });
    }
    client.getUserResolvable = getUserResolvable;
}