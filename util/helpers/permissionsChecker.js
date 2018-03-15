module.exports = (client, message, command) => {
    //Determine the permissions priority using the execution order
    const guildEntry = client.guildData.get(message.guild.id);
    let allowed;
    if (command.conf && command.conf.requirePerms) {
        let missingPerms = [];
        command.conf.requirePerms.forEach(perm => {
            if (!message.guild.members.get(client.user.id).hasPermission(perm)) {
                missingPerms.push(perm);
            }
        });
        if (missingPerms.length > 0) return missingPerms;
    }
    if (command.conf.ownerOnly && client.config.ownerID !== message.author.id) return false;
    if (client.config.ownerID === message.author.id) return true;
    if (command.help.category === 'admin' && !client.config.admins.includes(message.author.id)) return false;
    if (client.config.admins.includes(message.author.id)) return true;
    //Check if Felix has the permissions needed for the command to work properly
    //Global permissions
    if (guildEntry.permissions.global.allowedCommands.includes(`${command.help.category}*`)) allowed = true;
    if (guildEntry.permissions.global.restrictedCommands.includes(`${command.help.category}*`)) allowed = false;
    //Check commands after categories to give a priority to commands against categories
    if (guildEntry.permissions.global.allowedCommands.includes(command.help.name)) allowed = true;
    if (guildEntry.permissions.global.restrictedCommands.includes(command.help.name)) allowed = false;
    //Channel permissions
    if (guildEntry.permissions.channels.find(c => c.id === message.channel.id) && guildEntry.permissions.channels.find(c => c.id === message.channel.id).allowedCommands.includes(`${command.help.category}*`)) allowed = true;
    if (guildEntry.permissions.channels.find(c => c.id === message.channel.id) && guildEntry.permissions.channels.find(c => c.id === message.channel.id).restrictedCommands.includes(`${command.help.category}*`)) allowed = false;
    if (guildEntry.permissions.channels.find(c => c.id === message.channel.id) && (guildEntry.permissions.channels.find(c => c.id === message.channel.id).allowedCommands.includes(command.help.name))) allowed = true;
    if (guildEntry.permissions.channels.find(c => c.id === message.channel.id) && (guildEntry.permissions.channels.find(c => c.id === message.channel.id).restrictedCommands.includes(command.help.name))) allowed = false;
    //Roles permissions
    let highestRole = message.guild.members.get(message.author.id).roles.filter(r => guildEntry.permissions.roles.find(sr => sr.id === r)).sort((a, b) => b.position - a.position)[0];
    if (highestRole && guildEntry.permissions.roles.find(r => r.id === highestRole).allowedCommands.includes(`${command.help.category}*`)) allowed = true;
    if (highestRole && guildEntry.permissions.roles.find(r => r.id === highestRole).restrictedCommands.includes(`${command.help.category}*`)) allowed = false;
    if (highestRole && (guildEntry.permissions.roles.find(r => r.id === highestRole).allowedCommands.includes(command.help.name))) allowed = true;
    if (highestRole && (guildEntry.permissions.roles.find(r => r.id === highestRole).restrictedCommands.includes(command.help.name))) allowed = false;
    //Users permissions
    if (guildEntry.permissions.users.find(u => u.id === message.author.id) && guildEntry.permissions.users.find(u => u.id === message.author.id).allowedCommands.includes(`${command.help.category}*`)) allowed = true;
    if (guildEntry.permissions.users.find(u => u.id === message.author.id) && guildEntry.permissions.users.find(u => u.id === message.author.id).restrictedCommands.includes(`${command.help.category}*`)) allowed = false;
    if (guildEntry.permissions.users.find(u => u.id === message.author.id) && (guildEntry.permissions.users.find(u => u.id === message.author.id).allowedCommands.includes(command.help.name))) allowed = true;
    if (guildEntry.permissions.users.find(u => u.id === message.author.id) && (guildEntry.permissions.users.find(u => u.id === message.author.id).restrictedCommands.includes(command.help.name))) allowed = false;
    if (message.guild.members.get(message.author.id).hasPermission('administrator')) allowed = true;
    return allowed;
}