const registerCase = require("../util/helpers/registerCase.js")

module.exports = async(client, guild, member) => {
    const guildEntry = client.guildData.get(guild.id) || client.defaultGuildData(guild.id);
    try {
        if (guildEntry.onEvent.guildMemberRemove.farewell.enabled && guildEntry.onEvent.guildMemberRemove.farewell.message && !member.bot) {
            let message = guildEntry.onEvent.guildMemberRemove.farewell.message;
            //---------------------------------------Replace all instances of %USER%, %USERNAME% and %GUILD%--------------------------------------
            if (typeof message === "string") message = message.replace(/\%USER\%/gim, `<@${member.user.id}>`).replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
            else {
                for (var key in message) {
                    if (typeof message[key] === "string") message[key] = message[key].replace(/\%USER\%/gim, `<@${member.user.id}>`).replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
                }
            }; //---------------------------------------------------------Greets------------------------------------------------------------
            if (!member.guild.channels.has(guildEntry.onEvent.guildMemberRemove.farewell.channel)) {
                guildEntry.onEvent.guildMemberRemove.farewell.error = "Unknown Channel";
                throw client.guildData.set(member.guild.id, guildEntry); //If getting the channel return undefined
            }
            client.createMessage(member.guild.channels.get(guildEntry.onEvent.guildMemberRemove.farewell.channel).id, message).catch(err => {
                if (err.code === 50013) {
                    guildEntry.onEvent.guildMemberRemove.farewell.error = "Missing Permissions"; //error code for Missing Permissions
                    throw client.guildData.set(member.guild.id, guildEntry);
                } else if (err.code === 50001) {
                    guildEntry.onEvent.guildMemberRemove.farewell.error = "Missing Permissions" //error code for Missing Access
                    throw client.guildData.set(member.guild.id, guildEntry);
                }
                //-----------------------------------If the error is not related to permissions nor unexisting channel-------------------------
                guildEntry.onEvent.guildMemberRemove.farewell.error = "Unknown Error";
                client.guildData.set(member.guild.id, guildEntry);
                client.emit("error", err);
            });
        }
    } catch (err) {}

    if (guildEntry.generalSettings.modLogChannel) {
        let auditCase = await guild.getAuditLogs(1, null, 20).catch(err => false);
        //If we can't ensure that its a kick, ignore it (since yeah kicks are with the same event than a casual leaving member, why you ask? idk, blame discord)
        if (!auditCase || !auditCase.entries[0] || auditCase.entries[0].targetID !== member.id) return;
        registerCase(client, {
            guild: guild,
            user: member.user,
            moderator: auditCase && auditCase.entries[0] ? auditCase.entries[0].user : false,
            action: "kick",
            reason: auditCase && auditCase.entries[0] ? auditCase.entries[0].reason : false
        });
    }
}