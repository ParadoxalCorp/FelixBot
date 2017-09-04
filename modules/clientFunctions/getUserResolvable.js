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
            var resolvedUsers = potentialUserResolvables.forEach(function(arg) {
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
                    if (matchedByPartial === userObject) {
                        return; //In case "Karen Kujou" with a space or something
                    }
                    matchedByPartial = userObject;
                    return usersResolved.set(userObject.id, userObject);
                }
            });
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