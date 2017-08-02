const fs = require("fs-extra");
exports.run = async(client, message) => {
    try {
        const args = message.content.substr(message.content.indexOf(" ") + 1);
        if (args.startsWith(client.prefix)) { //cuz if there is no whitespace, its -1 + 1 so 0
            return await message.channel.send(":x: You didnt specified any arguments");
        }
        const guildEntry = client.guildDatas.get(message.guild.id);
        const set = args.indexOf("-set");
        const remove = args.indexOf("-r");
        if ((set !== -1) && (remove === -1)) {
            if (guildEntry.updateChannel === "") {
                guildEntry.updateChannel = message.channel.id; //This one is to quickly read the datas 
                client.database.Data.global[0].updateChannels.push(message.channel.id);
                client.guildDatas.set(message.guild.id, guildEntry);
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
                return await message.channel.send(":white_check_mark: Okay, i will send the changelogs here !");
            } else {
                var channel;
                if (message.guild.channels.get(guildEntry.updateChannel)) {
                    channel = message.guild.channels.get(guildEntry.updateChannel).name;
                } else {
                    channel = "#deleted";
                }
                return await message.channel.send(`:x: The channel **#${channel}** is already set as an update channel`);
            }
        } else if ((remove !== -1) && (set === -1)) {
            var updateChannel = guildEntry.updateChannel;
            if (updateChannel === "") {
                return await message.channel.send(":x: This channel is not in the database, so i cant remove it from the database, i think :thinking:");
            } else {
                try {
                    client.database.Data.global[0].updateChannels.splice(client.database.Data.global[0].updateChannels.indexOf(guildEntry.updateChannel), 1);
                    guildEntry.updateChannel = "";
                    client.guildDatas.set(message.guild.id, guildEntry);
                    fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                    return await message.channel.send(":white_check_mark: Okay, i removed this channel from the database");
                } catch (err) {
                    await message.channel.send(":x: A critical error occured, i sent the details to my developper, feel free to join the support server if you want to know more");
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
                    return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server                
                }
            }
        }
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
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["uc", "setupdate"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'updatechan',
    parameters: '`-set`, `-r`(remove)',
    description: 'Define a channel as an update channel, felix will sends the changelogs there',
    usage: 'updatechan -set',
    category: 'settings'
};
