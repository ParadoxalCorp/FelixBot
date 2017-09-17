module.exports = async(client) => {
    client.getPermissionsLevel = function(guildId, id) {
        const guildEntry = client.guildData.get(guildId);
        var thingLevel = false;
        let i = 0;
        guildEntry.permissionsLevels.things.forEach(function(level) {
            if (level.includes(id)) {
                return thingLevel = i;
            }
            i++;
        });
        return thingLevel;
    }
}