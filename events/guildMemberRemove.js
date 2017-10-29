module.exports = async(client, member) => {
    const guildEntry = client.guildData.get(member.guild.id) || client.defaultGuildData(member.guild.id);
    if (guildEntry.onEvent.guildMemberRemove.farewell.enabled && guildEntry.onEvent.guildMemberRemove.farewell.message) {
        let message = guildEntry.onEvent.guildMemberRemove.farewell.message || guildEntry.onEvent.guildMemberRemove.farewell.embed; //Whether the message to send is an embed or not
        //---------------------------------------Replace all instances of %USER%, %USERNAME% and %GUILD%--------------------------------------
        message = message.replace(/\%USERNAME\%/gim, `${member.user.username}`).replace(/\%USERTAG%/gim, `${member.user.tag}`).replace(/\%GUILD\%/gim, `${member.guild.name}`);
        //---------------------------------------------------------Greets------------------------------------------------------------
        if (!member.guild.channels.has(guildEntry.onEvent.guildMemberAdd.greetings.channel)) {
            guildEntry.onEvent.guildMemberRemove.farewell.error = "Unknown Channel";
            return client.guildData.set(member.guild.id, guildEntry); //If getting the channel return undefined
        }
        await member.guild.channels.get(guildEntry.onEvent.guildMemberRemove.farewell.channel).send(message).catch(err => {
            if (err.code === 50013) {
                guildEntry.onEvent.guildMemberRemove.farewell.error = "Missing Permissions"; //error code for Missing Permissions
                return client.guildData.set(member.guild.id, guildEntry);
            } else if (err.code === 50001) {
                guildEntry.onEvent.guildMemberRemove.farewell.error = "Missing Permissions" //error code for Missing Access
                return client.guildData.set(member.guild.id, guildEntry);
            }
            //-----------------------------------If the error is not related to permissions nor unexisting channel-------------------------
            guildEntry.onEvent.guildMemberRemove.farewell.error = "Unknown Error";
            client.guildData.set(member.guild.id, guildEntry);
            console.error(err);
            client.Raven.captureException(err);
        });
    }
}