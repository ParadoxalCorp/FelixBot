const registerCase = require("../util/helpers/registerCase.js")

module.exports = async(client, guild, user) => {
    const guildEntry = client.guildData.get(guild.id) || client.defaultGuildData(guild.id);
    if (client.guilds.get(guild.id).lastBanned === user.id) {
        client.guilds.get(guild.id).lastBanned = undefined;
        return;
    }
    if (guildEntry.generalSettings.modLogChannel) {
        let auditCase = await guild.getAuditLogs(1, null, 22).catch(err => false);
        registerCase(client, {
            guild: guild,
            user: user,
            moderator: auditCase && auditCase.entries[0] ? auditCase.entries[0].user : false,
            action: "ban",
            reason: auditCase && auditCase.entries[0] ? auditCase.entries[0].reason : false
        });
    }
}