const unirest = require("unirest");

module.exports = async(client, message) => {
    if (client.maintenance && message.author.id !== client.database.ownerId) return; //Ignore users during maintenance
    if (message.author.bot) return;
    if (client.userData.get(message.author.id)) {
        if ((client.userData.get(message.author.id).generalSettings.blackListed) && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users
    }
    const mentionned = message.mentions.users.first(); //--Afk feature--
    if (mentionned) {
        if (client.userData.get(mentionned.id)) {
            if (client.userData.get(mentionned.id).generalSettings.afk !== false) { //If the mentionned user hasnt set any afk status, do nothing
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
        } else {
            client.userData.set(mentionned.id, client.defaultUserData(mentionned.id));
        }
    }
    if (message.channel.type !== "dm") {
        try { //In case felix got invited while being down
            if (!client.guildData.get(message.guild.id)) {
                client.guildData.set(message.guild.id, client.defaultGuildData(message.guild.id));
            }
        } catch (err) {
            console.error(err);
            client.Raven.captureException(err);
        }
        const guildEntry = client.guildData.get(message.guild.id);
        if (message.content.startsWith(guildEntry.generalSettings.prefix + "t ")) {
            try {
                return require("../handlers/tagHandler.js")(client, message);
            } catch (err) {
                console.error(err);
                return client.Raven.captureException(err);
            }
        }
        require("../handlers/expHandler.js")(client, message);
        if (message.content.startsWith(`<@${client.user.id}>`) || message.content.startsWith(`<@!${client.user.id}>`)) { //Stuff like @Felix prefix            
            var args = message.content.split(/\s+/gim);
            args.shift();
            const request = args[0];
            if (request === "prefix") {
                return message.channel.send("The current prefix on this server is **" + guildEntry.generalSettings.prefix + "**");
            } else if (request === "help") {
                if (message.guild) {
                    return await message.channel.send("Here's the commands list, you can see the detailled help of a command using `" + guildEntry.generalSettings.prefix + "help commandname`\n\n" + client.overallHelp);
                } else {
                    return await message.channel.send("Here's the commands list, you can see the detailled help of a command using `" + client.database.prefix + "help commandname`\n\n" + client.overallHelp);
                }
            }
        }
    }
    //Commands
    require("../handlers/commandHandler.js")(client, message);
}