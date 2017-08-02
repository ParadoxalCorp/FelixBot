const fs = require("fs-extra");
const unirest = require("unirest");

module.exports = async (client, member) => {
    try {
        const guildEntry = client.guildDatas.get(member.guild.id);
        if (!guildEntry.farewell) return;
        if (guildEntry.farewell === "") return;
        var farewellMsg = guildEntry.farewell;
        farewellMsg = farewellMsg.replace(/\{user\}/gim, `${member.user.username}#${member.user.discriminator}`);
        farewellMsg = farewellMsg.replace(/\{server\}/gim, `${member.guild.name}`);
        if ((!member.guild.channels.get(guildEntry.farewellChan)) && (guildEntry.farewellChan !== "")) {
            return await member.guild.owner.send("Sorry to disturb you, but the channel where i am supposed to send the farewell dont exist anymore, just in case you didnt knew");
        }
        return await member.guild.channels.get(guildEntry.farewellChan).send(farewellMsg);
    } catch (err) {
        console.error(err);
        return await client.channels.get(client.errorLog).send("**Error:** " + err + "\n**Detailled Error:** " + err.stack);
    }
};
