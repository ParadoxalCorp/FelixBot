exports.run = async(client, message) => {
    try {
        const cmdName = message.content.substr(message.content.indexOf(" ") + 1).trim();
        try {
            const cmd = require(`./${cmdName}`);
            console.log(`Loading Command: ${cmd.help.name}. 👌`);
            client.commands.set(cmd.help.name, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
        } catch (e) {
            return await message.channel.send(`Unable to load command ${cmdName}: ${e.stack}`);
        }
        await message.channel.send("Attempt to add the command to the collection: :white_check_mark:\nAttempt to rebuild the help: pending").then(async(message) => {
            try { //rebuild the help
                const categories = ["generic", "miscellaneous", "image", "utility", "fun", "moderation", "settings"];
                var i;
                client.overallHelp = ""; //Clean the content;               
                for (i = 0; i < categories.length; i++) {
                    const categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
                    client.overallHelp += `**${categories[i]}** =>`;
                    client.overallHelp += categoryCommands.map(c => `\`${c.help.name}\` `);
                    client.overallHelp += "\n\n";
                }
                client.overallHelp = client.overallHelp.replace(/undefined/gim, ""); //To remove the "undefined"
            } catch (err) {
                console.error(`[ERROR] => Failed to build the help: ${err.stack}`);
            }
            return await message.edit("Attempt to add the command to the collection: :white_check_mark:\nAttempt to rebuild the help: :white_check_mark:");
        });
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    disabled: false,
    permLevel: 42
};

exports.help = {
    name: 'addcmd',
    description: 'Add a command to the command list, so there\'s no need to restart the bot',
    usage: 'addcmd cmdname',
    category: 'admin',
};
