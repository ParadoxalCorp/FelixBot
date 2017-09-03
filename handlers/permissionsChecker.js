module.exports = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        const guildEntry = client.guildData.get(message.guild.id);
        var usrLevel = false;
        var isAdmin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
        var hasLevel0 = guildEntry.permissionsLevels.things[0];
        var hasLevel1 = guildEntry.permissionsLevels.things[1];
        var hasLevel2 = guildEntry.permissionsLevels.things[2];
        var hasLevel42 = client.config.thingsLevel42;
        var globalLvl = guildEntry.globalLevel; //the server level
        var userId = message.author.id;
        //----global check----                     //The following checks are just to determine the user access level by using the execution order
        if (globalLvl !== "none") {
            var globalToNum = Number(globalLvl);
            usrLevel = globalToNum;
        }
        //-----channels check-----
        let i = 0;
        guildEntry.permissionsLevels.things.forEach(function(level) {
            if (level.includes(message.channel.id)) {
                return usrLevel = i;
            }
            i++;
        });
        //-----roles check-----
        var rolesInDb = [] //Array in case there are more than 1 role with level that the user has
        var highestRole = "none";
        for (var [key, value] of message.guild.members.get(message.author.id).roles) {
            if ((hasLevel0.includes(key)) || (hasLevel1.includes(key)) || (hasLevel2.includes(key))) {
                rolesInDb.push(key);
            }
        }
        if (rolesInDb.length === 1) {
            highestRole = rolesInDb[0];
            i = 0;
            guildEntry.permissionsLevels.things.forEach(function(level) {
                if (level.includes(rolesInDb[0])) {
                    return usrLevel = i;
                }
                i++;
            });
        } else if (rolesInDb.length > 1) { //If there are more than 1 role with level that the user has, compare and only keep the highest one
            for (i = 0; i < rolesInDb.length; i++) {
                if (highestRole === "none") {
                    var compare = message.guild.roles.get(rolesInDb[i]).comparePositionTo(message.guild.roles.get(rolesInDb[i + 1]))
                    if (compare > 0) {
                        highestRole = rolesInDb[i];
                    } else {
                        highestRole = rolesInDb[i + 1];
                    }
                } else {
                    var compare = message.guild.roles.get(rolesInDb[i]).comparePositionTo(message.guild.roles.get(highestRole));
                    if (compare > 0) {
                        highestRole = rolesInDb[i];
                    }
                }
            }
            i = 0;
            guildEntry.permissionsLevels.things.forEach(function(level) {
                if (level.includes(highestRole)) {
                    return usrLevel = i;
                }
                i++;
            });
        }
        //-----users check-----
        i = 0;
        guildEntry.permissionsLevels.things.forEach(function(level) {
            if (level.includes(userId)) {
                return usrLevel = i;
            }
            i++;
        });
        if (isAdmin) {
            usrLevel = 2;
        }
        if (message.author.id === message.guild.ownerID) { //Give the level 3 of death to the guilds owners
            usrLevel = 3;
        }
        if (hasLevel42.includes(userId)) {
            usrLevel = 42;
        }
        if (!usrLevel) {
            usrLevel = 1; //If there is no level set for this user/channel/server/role, give the user the default level
        }
        resolve(usrLevel);
    });
}