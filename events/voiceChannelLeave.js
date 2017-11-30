module.exports = async(client, member, channel) => {
    const guildEntry = client.guildData.get(member.guild.id) || client.defaultUserData(member.guild.id);
    if (!guildEntry.generalSettings.levelSystem.users.find(u => u.id == member.id)) {
        guildEntry.generalSettings.levelSystem.users.push({
            id: member.id,
            expCount: 0,
            level: 0,
            messages: 0,
            joinedVc: 0,
            leftVc: 0,
            totalVcTime: 0
        });
    }
    const userPos = guildEntry.generalSettings.levelSystem.users.findIndex(u => u.id === member.id);
    guildEntry.generalSettings.levelSystem.users[userPos].leftVc = Date.now();
    if (guildEntry.generalSettings.levelSystem.users[userPos].joinedVc) guildEntry.generalSettings.levelSystem.users[userPos].totalVcTime = guildEntry.generalSettings.levelSystem.users[userPos].leftVc - guildEntry.generalSettings.levelSystem.users[userPos].joinedVc;
    client.guildData.set(member.guild.id, guildEntry);
}