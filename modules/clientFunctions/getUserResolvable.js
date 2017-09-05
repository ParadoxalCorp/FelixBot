const Discord = require("discord.js");
module.exports = async(client, message) => {
    client.getUserResolvable = function(message, options) {
        return new Promise(async(resolve, reject) => {
            if (!message.content) {
                return reject("The message content must be provided !");
            }
            var potentialUserResolvables = message.content.split(/\s+/gim);
            potentialUserResolvables.shift();
            const usersResolved = new Discord.Collection();
            var matchedByPartial = false;
            if (options && options.guildOnly) { //Only the provided guild members
                for (let i = 0; i < potentialUserResolvables.length; i++) {
                    //------------------Resolve by ID--------------------
                    if (potentialUserResolvables[i].length >= 3) {
                        if (!isNaN(potentialUserResolvables[i])) {
                            if (message.guild.members.get(potentialUserResolvables[i])) {
                                usersResolved.set(message.guild.members.get(potentialUserResolvables[i]).id, message.guild.members.get(potentialUserResolvables[i]).user);
                            }
                        }
                        //------------------Resolve by whole name--------------
                        let filterByWholeName = message.guild.members.filter(u => u.user.username === potentialUserResolvables[i]);
                        if (filterByWholeName.size > 0) {
                            usersResolved.set(filterByWholeName.first().id, filterByWholeName.first().user);
                        } else {
                            //-----------------Resolve by case-insensitive name or nickname-----------------------------------
                            let filterUsers = message.guild.members.filter(u => u.user.username.toLowerCase() === potentialUserResolvables[i].toLowerCase() || (u.user.nickname && u.user.nickname.toLowerCase() === potentialUserResolvables[i].toLowerCase()));
                            if (filterUsers.size > 0) {
                                usersResolved.set(filterUsers.first().id, filterUsers.first().user);
                            } else {
                                //----------------Resolve by partial case-insensitive name or nickname-------------------------
                                let filterByPartial = message.guild.members.filter(u => u.user.username.toLowerCase().includes(potentialUserResolvables[i].toLowerCase()) || (u.user.nickname && u.user.nickname.toLowerCase().includes(potentialUserResolvables[i].toLowerCase())));
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
                                            if (!selectedUser.reply || isNaN(selectedUser.reply.content) || selectedUser.reply.content > filteredArray.length || selectedUser.reply.content < 1) {
                                                await selectedUser.question.delete();
                                                if (selectedUser.reply && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                                    await selectedUser.reply.delete();
                                                }
                                            } else {
                                                userObject = filteredArray[selectedUser.reply.content - 1].user;
                                                await selectedUser.question.delete();
                                                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                                    await selectedUser.reply.delete();
                                                }
                                            }
                                        }
                                    }
                                    matchedByPartial = userObject;
                                    usersResolved.set(userObject.id, userObject);
                                }
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
            if (message.mentions.users.first()) {
                message.mentions.users.forEach(function(mentionned) {
                    return usersResolved.set(mentionned.id, mentionned);
                });
            }
            resolve(usersResolved);
        });
    }
}