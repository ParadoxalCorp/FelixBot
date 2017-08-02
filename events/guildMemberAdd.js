const fs = require("fs-extra");
const unirest = require("unirest");

module.exports = async (client, member) => {
    try {
        const guildEntry = client.guildDatas.get(member.guild.id);
        const role = member.guild.roles.get(guildEntry.onJoinRole);
        if ((guildEntry.onJoinRole !== "") && (member.user.bot !== true)) {
            member.addRole(role);
        }
        if ((!member.guild.roles.get(guildEntry.onJoinRole)) && (guildEntry.onJoinRole !== "")) {
            await member.guild.owner.send("Hey ! Sorry for disturbing you, but im supposed to give a role to every new members. However, it seems that the role doesnt exist anymore. Again, sorry for disturbing you, just in case you didnt knew. You can remove that role from my database using `f!onjoinrole -remove`");
        }
        if (guildEntry.greetings === "") return;
        var greetingsMsg = guildEntry.greetings;
        greetingsMsg = greetingsMsg.replace(/\{user\}/gim, `<@${member.id}>`);
        greetingsMsg = greetingsMsg.replace(/\{username\}/gim, `${member.user.username}`);        
        greetingsMsg = greetingsMsg.replace(/\{server\}/gim, `${member.guild.name}`);
        if (guildEntry.greetingsMethod === "dm") {
            return await member.send(greetingsMsg);
        } else if (guildEntry.greetingsMethod === "channel") {
            if ((!member.guild.channels.get(guildEntry.greetingsChan)) && (guildEntry.greetingsChan !== "")) {
                return await member.guild.owner.send("Sorry to disturb you, but the channel where i am supposed to send the greetings dont exist anymore, just in case you didnt knew");
            }
            return await member.guild.channels.get(guildEntry.greetingsChan).send(greetingsMsg);
        }
    } catch (err) {
        console.error(err);
    }
};
