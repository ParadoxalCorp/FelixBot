const Discord = require('discord.js');

module.exports = async(client) => {
    client.getUserTags = async function(users) {
        return new Promise(async(resolve, reject) => {
            if (typeof users !== "string" && !Array.isArray(users)) throw "FunctionCallError: Users must either be a string of a single user id or an array of users id";
            if (typeof users === "string") {
                const tagList = Array.from(client.tagData.filter(t => JSON.parse(t).author === users).map(t => JSON.parse(t).name));
                return tagList;
            } else {
                var usersTags = new Discord.Collection();
                users.forEach(function(id) {
                    const tagList = Array.from(client.tagData.filter(t => JSON.parse(t).author === id).map(t => JSON.parse(t).name));
                    if (tagList.length !== 0) {
                        usersTags.set(id, {
                            user: id,
                            tags: tagList
                        });
                    }
                });
                resolve(usersTags);
            }
        });
    }
}