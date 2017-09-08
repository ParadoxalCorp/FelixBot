module.exports = async(client, member) => {
    const guildEntry = client.guildData.get(member.guild.id) || client.defaultGuildData(member.guild.id);
    if (guildEntry.onEvent.guildMemberAdd.onJoinRole.length > 0 && member.guild.member(client.user).hasPermission('MANAGE_ROLES')) { //----------------------------Add roles-----------------------
        let existingRoles = guildEntry.onEvent.guildMemberAdd.onJoinRole.filter(r => member.guild.roles.get(r)); //Filter roles which doesnt exist anymore
        if (existingRoles.length > 0) await member.addRoles(existingRoles); //Add roles
        guildEntry.onEvent.guildMemberAdd.onJoinRole = existingRoles; //Update the
        client.guildData.set(member.guild.id, guildEntry); //guild entry
    }
    if (guildEntry.onEvent.guildMemberAdd.greetings.message || guildEntry.onEvent.guildMemberAdd.greetings.embed) {
        let message = guildEntry.onEvent.guildMemberAdd.greetings.message || guildEntry.onEvent.guildMemberAdd.greetings.embed; //Whether the message to send is an embed or not
        let method = member.user;
        //---------------------------------------Replace all instances of %USER%, %USERNAME% and %GUILD%--------------------------------------
        if (typeof message === "string") {
            message = message.replace(/\%USER\%/gim, `<@${member.user.id}>`).replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
        } else {
            message.embed.description = message.embed.description.replace(/\%USER\%/gim, `<@${member.user.id}>`).replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
        }
        //---------------------------------------------------------Greets------------------------------------------------------------
        if (guildEntry.onEvent.guildMemberAdd.greetings.channel && !guildEntry.onEvent.guildMemberAdd.greetings.dm) method = member.guild.channels.get(guildEntry.onEvent.guildMemberAdd.greetings.channel);
        try {
            method.send(message);
        } catch (err) {
            if (err.message === "Missing Permissions") return guildEntry.onEvent.guildMemberAdd.greetings.error = "Missing Permissions";
            else if (typeof method === "undefined") return guildEntry.onEvent.guildMemberAdd.greetings.error = "Unknown Channel";
            console.error(err);
            return client.Raven.captureException(err);
        }
    }
}