module.exports = async(client, oldMember, newMember) => {
    if (oldMember.voiceChannel = newMember.voiceChannel) return; //Since we actually don't care about other changes
    const guildEntry = client.guildData.get(newMember.guild.id);
    if (!guildEntry.generalSettings.levelSystem.users.find(u => u.id == newMember.id)) {
        guildEntry.generalSettings.levelSystem.users.push({
            id: newMember.id,
            expCount: 0,
            level: 0,
            messages: 0,
            joinedVc: 0,
            leftVc: 0,
            totalVcTime: 0
        });
    }
    const userPos = guildEntry.generalSettings.levelSystem.users.findIndex(u => u.id === newMember.id);
    if (newMember.voiceChannel && newMember.voiceChannelID !== newMember.guild.afkChannelID) guildEntry.generalSettings.levelSystem.users[userPos].joinedVc = Date.now();
    else if (!newMember.voiceChannel) {
        guildEntry.generalSettings.levelSystem.users[userPos].leftVc = Date.now();
        if (guildEntry.generalSettings.levelSystem.users[userPos].joinedVc) guildEntry.generalSettings.levelSystem.users[userPos].totalVcTime = guildEntry.generalSettings.levelSystem.users[userPos].leftVc - guildEntry.generalSettings.levelSystem.users[userPos].joinedVc;
    }
    client.guildData.set(newMember.guild.id, guildEntry);
}