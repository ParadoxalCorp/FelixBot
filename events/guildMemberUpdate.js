const ModerationHandler = require(`../util/helpers/moderationHandler`);
const sleep = require(`../util/modules/sleep`);

module.exports = async(client, guild, member, oldMember) => {
    const guildEntry = client.guildData.get(guild.id);
	if (!oldMember) {
		return;
	}
    const addedRole = member.roles.filter(r => !oldMember.roles.includes(r))[0];
    const removedRole = oldMember.roles.filter(r => !member.roles.includes(r))[0];
    if (!addedRole && !removedRole) return;
    const customMutedRole = guildEntry.moderation.mutedRoles.find(r => r.id === addedRole || removedRole);
    const mutedRole = guild.roles.find(r => r.name === 'muted');
    //Manual mute case
    if (addedRole) {
        if (!customMutedRole && (!mutedRole || mutedRole.id !== addedRole)) return;
        await sleep(500); //Give 500ms for discord to update the guilds audit log and felix to save the case if its the case
        //Abort if a case recent enough(registered less than 2 seconds ago) is the current member being muted with the current role. 
        //Long story short if the case of this event has already been registered
        if (guildEntry.modLog.cases.filter(c => (Date.now() - c.timestamp < 2000) && (c.user.id === member.id) && (c.action === customMutedRole ?
                (customMutedRole.name ? customMutedRole.name.replace(/%ROLE%/gim, guild.roles.get(customMutedRole.id).name) :
                    guild.roles.get(customMutedRole.id).name) : `mute`))[0]) {
            return;
        }
        let auditCase = await guild.getAuditLogs(null, null, 25).catch(err => false);
        auditCase = auditCase ? auditCase.entries.filter(e => e.targetID === member.id)[0] : false;
        if (!auditCase) return;
        ModerationHandler.registerCase(client, {
            guild: guild,
            user: member.user,
            moderator: auditCase.user,
            color: 0xffcc00,
            action: customMutedRole ? (customMutedRole.name ? customMutedRole.name.replace(/%ROLE%/gim, guild.roles.get(customMutedRole.id).name) : guild.roles.get(customMutedRole.id).name) : `mute`,
            performedAction: customMutedRole ? (customMutedRole.name ? customMutedRole.name.replace(/%ROLE%/gim, guild.roles.get(customMutedRole.id).name) : guild.roles.get(customMutedRole.id).name) : `Has been muted`,
        }).catch(err => {
            console.log(err, `^ ${guild.id} | ${guild.name}`);
        });
    } else if (removedRole) {
        if (!customMutedRole && (!mutedRole || mutedRole.id !== addedRole)) return;
        await sleep(500); //Give 500ms for discord to update the guilds audit log and felix to save the case if its the case
        //Abort if a case recent enough(registered less than 2 seconds ago) is the current member being unmuted with the current role. 
        //Long story short if the case of this event has already been registered
        if (guildEntry.modLog.cases.filter(c => (Date.now() - c.timestamp < 2000) && (c.user.id === member.id) && (c.action === customMutedRole ? 'Removed' + (customMutedRole.name ? customMutedRole.name.replace(/%ROLE%/gim, guild.roles.get(customMutedRole.id).name) : guild.roles.get(customMutedRole.id).name) : `unmute`))[0]) {
            return;
        }
        let auditCase = await guild.getAuditLogs(null, null, 25).catch(err => false);
        auditCase = auditCase ? auditCase.entries.filter(e => e.targetID === member.id)[0] : false;
        if (!auditCase) return;
        ModerationHandler.registerCase(client, {
            guild: guild,
            user: member.user,
            moderator: auditCase.user,
            color: 0x00ff00,
            action: customMutedRole ? 'Removed ' + (customMutedRole.name ? customMutedRole.name.replace(/%ROLE%/gim, guild.roles.get(customMutedRole.id).name) : guild.roles.get(customMutedRole.id).name) : `unmute`,
            performedAction: customMutedRole ? 'Removed ' + (customMutedRole.name ? customMutedRole.name.replace(/%ROLE%/gim, guild.roles.get(customMutedRole.id).name) : guild.roles.get(customMutedRole.id).name) : `Has been unmuted`,
        }).catch(err => {
            console.log(err, `^ ${guild.id} | ${guild.name}`);
        });
    }
}