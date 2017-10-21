const unirest = require("unirest");

module.exports = async(client, message) => {
    if (client.maintenance && message.author.id !== client.database.ownerId) return; //Ignore users during maintenance
    if (message.author.bot) return;
    if (client.userData.get(message.author.id) && client.userData.get(message.author.id).generalSettings.blackListed && message.author.id !== client.config.ownerId) return; //Ignore blacklisted users
    const mentionned = message.mentions.users.first(); //--Afk feature--
    if (mentionned && !client.userData.has(mentionned.id)) client.userData.set(mentionned.id, client.defaultUserData(mentionned.id));
    if (mentionned && client.userData.get(mentionned.id).generalSettings.afk) {
        await message.channel.send({
            embed: ({
                color: 3447003,
                author: {
                    name: mentionned.username + "#" + mentionned.discriminator + " is AFK",
                    icon_url: mentionned.avatarURL
                },
                description: client.userData.get(mentionned.id).generalSettings.afk
            })
        }).catch(console.error);
    }
    if (message.channel.type !== "dm") {
        if (!client.guildData.get(message.guild.id)) client.guildData.set(message.guild.id, client.defaultGuildData(message.guild.id));
        const guildEntry = client.guildData.get(message.guild.id);
        require("../handlers/expHandler.js")(client, message);
        /*if (message.content.startsWith(`<@${client.user.id}>`) || message.content.startsWith(`<@!${client.user.id}>`)) { //Stuff like @Felix prefix            
            let args = message.content.split(/\s+/gim);
            const request = args[0];
            if (request === "prefix") return message.channel.send("The current prefix on this server is **" + guildEntry.generalSettings.prefix + "**");
            else if (request === "help") return await message.channel.send("Here's the commands list, you can see the detailed help of a command using `" + guildEntry.generalSettings.prefix + "help commandname`\n\n" + client.overallHelp);
        }*/
    }
    //Commands
    require("../handlers/commandHandler.js")(client, message);
}