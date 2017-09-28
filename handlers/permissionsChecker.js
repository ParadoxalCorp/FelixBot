module.exports = async(client, message, command) => {
    return new Promise(async(resolve, reject) => {
        //Like the old system, we'll determine if a user is allowed or not using the execution order
        const guildEntry = client.guildData.get(message.guild.id);
        let allowed;
        if (command.help.category === 'admin' && !client.config.thingsLevel42.includes(message.author.id)) return resolve(false);
        //Global permissions
        if (guildEntry.permissionsLevels.global.allowedCommands.includes(command.help.name) || guildEntry.permissionsLevels.global.allowedCommands.includes(`${command.help.category}*`)) allowed = true;
        if (guildEntry.permissionsLevels.global.restrictedCommands.includes(command.help.name) || guildEntry.permissionsLevels.global.restrictedCommands.includes(`${command.help.category}*`)) allowed = false;
        //Channel permissions
        if (guildEntry.permissionsLevels.channels.find(c => c.id === message.channel.id) && (guildEntry.permissionsLevels.channels.find(c => c.id === message.channel.id).allowedCommands.includes(command.help.name) || guildEntry.permissionsLevels.channels.find(c => c.id === message.channel.id).allowedCommands.includes(`${command.help.category}*`))) allowed = true;
        if (guildEntry.permissionsLevels.channels.find(c => c.id === message.channel.id) && (guildEntry.permissionsLevels.channels.find(c => c.id === message.channel.id).restrictedCommands.includes(command.help.name) || guildEntry.permissionsLevels.channels.find(c => c.id === message.channel.id).restrictedCommands.includes(`${command.help.category}*`))) allowed = false;
        //Roles permissions
        let highestRole = message.guild.member(message.author).roles.filter(r => guildEntry.permissionsLevels.roles.find(sr => sr.id === r.id)).sort((a, b) => a.position - b.position).first();
        if (highestRole && (guildEntry.permissionsLevels.roles.find(r => r.id === highestRole.id).allowedCommands.includes(command.help.name) || guildEntry.permissionsLevels.roles.find(r => r.id === highestRole.id).allowedCommands.includes(`${command.help.category}*`))) allowed = true;
        if (highestRole && (guildEntry.permissionsLevels.roles.find(r => r.id === highestRole.id).restrictedCommands.includes(command.help.name) || guildEntry.permissionsLevels.roles.find(r => r.id === highestRole.id).restrictedCommands.includes(`${command.help.category}*`))) allowed = false;
        //Users permissions
        if (guildEntry.permissionsLevels.users.find(u => u.id === message.author.id) && (guildEntry.permissionsLevels.users.find(u => u.id === message.author.id).allowedCommands.includes(command.help.name) || guildEntry.permissionsLevels.users.find(u => u.id === message.author.id).allowedCommands.includes(`${command.help.category}*`))) allowed = true;
        if (guildEntry.permissionsLevels.users.find(u => u.id === message.author.id) && (guildEntry.permissionsLevels.users.find(u => u.id === message.author.id).restrictedCommands.includes(command.help.name) || guildEntry.permissionsLevels.users.find(u => u.id === message.author.id).restrictedCommands.includes(`${command.help.category}*`))) allowed = false;
        if (message.guild.member(message.author).hasPermission('ADMINISTRATOR')) allowed = true;
        resolve(allowed);
    });
}