module.exports = async(client, message) => {
    //Ignore users during maintenance
    if (client.maintenance && message.author.id !== client.config.ownerID) return;
    //Ignore bots
    if (message.author.bot) return;
    //Ignore blacklisted users
    if (client.userData.get(message.author.id) && client.userData.get(message.author.id).generalSettings.blackListed && message.author.id !== client.config.ownerID) return;
    //AFK feature
    const mentionned = message.mentions.users ? message.mentions.users.filter(u => client.userData.has(u.id) && client.userData.get(u.id).generalSettings.afk !== false) : {};
    if (mentionned.size < 3) { //(Don't send AFK messages if more than 2 mentionned users are AFK to avoid spam)
        mentionned.forEach(m => {
            message.channel.createMessage({
                embed: ({
                    color: 3447003,
                    author: {
                        name: `${m.tag} is AFK`,
                        icon_url: m.avatarURL
                    },
                    description: client.userData.get(m.id).generalSettings.afk
                })
            }).catch(console.error);
        });
    }
    if (message.guild) {
        if (!client.guildData.get(message.guild.id)) client.guildData.set(message.guild.id, client.defaultGuildData(message.guild.id));
        require("../util/helpers/expHandler.js").run(client, message);
    }
    //Commands
    require("../util/helpers/commandHandler.js")(client, message);
}