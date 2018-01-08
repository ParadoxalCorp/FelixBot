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
    guildEntry.levelSystem.users[userPos].joinedVc = Date.now();
    client.guildData.set(member.guild.id, guildEntry);
}