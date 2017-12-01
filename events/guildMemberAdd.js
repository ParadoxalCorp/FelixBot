module.exports = async(client, guild, member) => {
    if (member.bot) return;
    const guildEntry = client.guildData.get(member.guild.id) || client.defaultGuildData(member.guild.id);
    if (guildEntry.onEvent.guildMemberAdd.onJoinRole.length > 0 && member.guild.members.get(client.user.id).hasPermission('manageRoles')) { //----------------------------Add roles-----------------------
        let existingRoles = guildEntry.onEvent.guildMemberAdd.onJoinRole.filter(r => member.guild.roles.has(r)); //Filter roles which doesnt exist anymore
        if (existingRoles.length > 0) existingRoles.forEach(r => member.addRole(r, `The role is set to be given to new members`)); //Add roles
        guildEntry.onEvent.guildMemberAdd.onJoinRole = existingRoles; //Update the guild entry
        client.guildData.set(member.guild.id, guildEntry);
    }
    if (guildEntry.onEvent.guildMemberAdd.greetings.target && guildEntry.onEvent.guildMemberAdd.greetings.enabled && guildEntry.onEvent.guildMemberAdd.greetings.message) {
        let message = guildEntry.onEvent.guildMemberAdd.greetings.message;
        let channel = guildEntry.onEvent.guildMemberAdd.greetings.target === "dm" ? undefined : guild.channels.get(guildEntry.onEvent.guildMemberAdd.greetings.target);
        if (!channel || !channel.id) {
            //Don't set an error if the message is supposed to be sent to the user
            guildEntry.onEvent.guildMemberAdd.greetings.error = guildEntry.onEvent.guildMemberAdd.greetings.target === "dm" ? false : "Unknown Channel";
            if (guildEntry.onEvent.guildMemberAdd.greetings.target !== "dm") return client.guildData.set(member.guild.id, guildEntry); //If getting the channel return undefined
        }
        //---------------------------------------Replace all instances of %USER%, %USERNAME% and %GUILD%--------------------------------------
        if (typeof message === "string") message = message.replace(/\%USER\%/gim, `<@${member.user.id}>`).replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
        else {
            for (var key in message) {
                if (typeof message[key] === "string") message[key] = message[key].replace(/\%USER\%/gim, `<@${member.user.id}>`).replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
            }
        };
        //---------------------------------------------------------Greets------------------------------------------------------------
        if (guildEntry.onEvent.guildMemberAdd.greetings.target === "dm") {
            member.user.createMessage(message).catch(err => {
                if (err.code === 50013) {
                    guildEntry.onEvent.guildMemberAdd.greetings.error = "Missing Permissions"; //error code for Missing Permissions
                    return client.guildData.set(member.guild.id, guildEntry);
                } else if (err.code === 50001) {
                    guildEntry.onEvent.guildMemberAdd.greetings.error = "Missing Permissions" //error code for Missing Access
                    return client.guildData.set(member.guild.id, guildEntry);
                }
                //-----------------------------------If the error is not related to permissions nor unexisting channel-------------------------
                guildEntry.onEvent.guildMemberAdd.greetings.error = "Unknown Error";
                client.guildData.set(member.guild.id, guildEntry);
                client.emit("error", err);
            });
        } else {
            guild.channels.get(channel.id).createMessage(message).catch(err => {
                if (err.code === 50013) {
                    guildEntry.onEvent.guildMemberAdd.greetings.error = "Missing Permissions"; //error code for Missing Permissions
                    return client.guildData.set(member.guild.id, guildEntry);
                } else if (err.code === 50001) {
                    guildEntry.onEvent.guildMemberAdd.greetings.error = "Missing Permissions" //error code for Missing Access
                    return client.guildData.set(member.guild.id, guildEntry);
                }
                //-----------------------------------If the error is not related to permissions nor unexisting channel-------------------------
                guildEntry.onEvent.guildMemberAdd.greetings.error = "Unknown Error";
                client.guildData.set(member.guild.id, guildEntry);
                client.emit("error", err);
            });
        }
    }
}