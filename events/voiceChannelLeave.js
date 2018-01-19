module.exports = async(client, member, channel) => {
    const guildEntry = client.guildData.get(member.guild.id) || client.defaultGuildData(member.guild.id);
    if (!guildEntry.levelSystem.users.find(u => u.id == member.id)) {
        guildEntry.levelSystem.users.push({
            id: member.id,
            expCount: 0,
            level: 0,
            messages: 0,
            joinedVc: 0,
            leftVc: 0,
            totalVcTime: 0
        });
    }
    const userPos = guildEntry.levelSystem.users.findIndex(u => u.id === member.id);
    guildEntry.levelSystem.users[userPos].leftVc = Date.now();
    if (guildEntry.levelSystem.users[userPos].joinedVc) guildEntry.levelSystem.users[userPos].totalVcTime = guildEntry.levelSystem.users[userPos].leftVc - guildEntry.levelSystem.users[userPos].joinedVc;
    client.guildData.set(member.guild.id, guildEntry);
}