const registerCase = require("../util/helpers/registerCase.js")

module.exports = async(client, guild, user) => {
    const guildEntry = client.guildData.get(guild.id) || client.defaultGuildData(guild.id);
    if (client.guilds.get(guild.id).lastBanned === user.id) {
        client.guilds.get(guild.id).lastBanned = undefined;
        return;
    }
    if (guildEntry.generalSettings.modLogChannel) {
        let lastHackbanned = client.guilds.get(guild.id).lastHackbanned;
        let auditCase = await guild.getAuditLogs(1).catch(err => false);
        registerCase(client, {
            guild: guild,
            user: user,
            moderator: lastHackbanned && lastHackbanned.moderator ? lastHackbanned.moderator : (auditCase && auditCase.entries[0] ? auditCase.entries[0].user : false),
            action: lastHackbanned && lastHackbanned.user === user.id ? "hackban" : "ban",
            reason: auditCase && auditCase.entries[0] ? auditCase.entries[0].reason : false
        });
    }
}