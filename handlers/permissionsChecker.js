module.exports = async(client, message, command) => {
    return new Promise(async(resolve, reject) => {
        //Like the old system, we'll determine if a user is allowed or not using the execution order
        const guildEntry = client.guildData.get(message.guild.id);
        let allowed;
        if (command.help.category === 'admin' && !client.config.admins.includes(message.author.id)) return resolve(false);
        //Global permissions
        if (guildEntry.permissions.global.allowedCommands.includes(command.help.name) || guildEntry.permissions.global.allowedCommands.includes(`${command.help.category}*`)) allowed = true;
        if (guildEntry.permissions.global.restrictedCommands.includes(command.help.name) || guildEntry.permissions.global.restrictedCommands.includes(`${command.help.category}*`)) allowed = false;
        //Channel permissions
        if (guildEntry.permissions.channels.find(c => c.id === message.channel.id) && (guildEntry.permissions.channels.find(c => c.id === message.channel.id).allowedCommands.includes(command.help.name) || guildEntry.permissions.channels.find(c => c.id === message.channel.id).allowedCommands.includes(`${command.help.category}*`))) allowed = true;
        if (guildEntry.permissions.channels.find(c => c.id === message.channel.id) && (guildEntry.permissions.channels.find(c => c.id === message.channel.id).restrictedCommands.includes(command.help.name) || guildEntry.permissions.channels.find(c => c.id === message.channel.id).restrictedCommands.includes(`${command.help.category}*`))) allowed = false;
        //Roles permissions
        let highestRole = message.guild.member(message.author).roles.filter(r => guildEntry.permissions.roles.find(sr => sr.id === r.id)).sort((a, b) => b.position - a.position).first();
        if (highestRole && (guildEntry.permissions.roles.find(r => r.id === highestRole.id).allowedCommands.includes(command.help.name) || guildEntry.permissions.roles.find(r => r.id === highestRole.id).allowedCommands.includes(`${command.help.category}*`))) allowed = true;
        if (highestRole && (guildEntry.permissions.roles.find(r => r.id === highestRole.id).restrictedCommands.includes(command.help.name) || guildEntry.permissions.roles.find(r => r.id === highestRole.id).restrictedCommands.includes(`${command.help.category}*`))) allowed = false;
        //Users permissions
        if (guildEntry.permissions.users.find(u => u.id === message.author.id) && (guildEntry.permissions.users.find(u => u.id === message.author.id).allowedCommands.includes(command.help.name) || guildEntry.permissions.users.find(u => u.id === message.author.id).allowedCommands.includes(`${command.help.category}*`))) allowed = true;
        if (guildEntry.permissions.users.find(u => u.id === message.author.id) && (guildEntry.permissions.users.find(u => u.id === message.author.id).restrictedCommands.includes(command.help.name) || guildEntry.permissions.users.find(u => u.id === message.author.id).restrictedCommands.includes(`${command.help.category}*`))) allowed = false;
        if (message.guild.member(message.author).hasPermission('ADMINISTRATOR')) allowed = true;
        resolve(allowed);
    });
}