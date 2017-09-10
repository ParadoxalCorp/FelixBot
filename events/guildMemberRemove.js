module.exports = async(client, member) => {
    const guildEntry = client.guildData.get(member.guild.id) || client.defaultGuildData(member.guild.id);
    if (guildEntry.onEvent.guildMemberRemove.farewell.enabled) {
        let message = guildEntry.onEvent.guildMemberRemove.farewell.message || guildEntry.onEvent.guildMemberRemove.farewell.embed; //Whether the message to send is an embed or not
        //---------------------------------------Replace all instances of %USER%, %USERNAME% and %GUILD%--------------------------------------
        if (typeof message === "string") {
            message = message.replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
        } else {
            message.embed.description = message.embed.description.replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
        }
        //---------------------------------------------------------Greets------------------------------------------------------------
        try {
            await member.guild.channels.get(guildEntry.onEvent.guildMemberRemove.farewell.channel).send(message);
        } catch (err) {
            if (err.code === 50013) {
                guildEntry.onEvent.guildMemberRemove.farewell.error = "Missing Permissions"; //error code for Missing Permissions
                return client.guildData.set(member.guild.id, guildEntry);
            } else if (typeof method === "undefined") {
                guildEntry.onEvent.guildMemberRemove.farewell.error = "Unknown Channel";
                return client.guildData.set(member.guild.id, guildEntry); //If getting the channel return undefined
            } else if (err.code === 50001) {
                guildEntry.onEvent.guildMemberRemove.farewell.error = "Missing Permissions" //error code for Missing Access
                return client.guildData.set(member.guild.id, guildEntry);
            }
            //-----------------------------------If the error is not related to permissions nor unexisting channel-------------------------
            guildEntry.onEvent.guildMemberRemove.farewell.error = "Unknown Error";
            client.guildData.set(member.guild.id, guildEntry);
            console.error(err);
            return client.Raven.captureException(err);
        }
    }
}