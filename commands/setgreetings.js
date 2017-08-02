const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const remove = message.content.indexOf("-remove");
        const dm = message.content.indexOf("-dm");
        const channel = message.content.indexOf("-channel");
        const guildEntry = client.guildDatas.get(message.guild.id);
        if ((remove !== -1) && (dm === -1) && (channel === -1)) {
            if (guildEntry.greetings === "") {
                return await message.channel.send(":x: There is not any greetings message");
            }
            guildEntry.greetings = "";
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, i removed the greetings message");
        } else if ((dm !== -1) && (remove === -1) && (channel === -1)) {
            const greetings = message.content.substr(dm + 4);
            if (greetings === "") {
                return await message.channel.send(":x: You cannot set the greetings to nothing");
            }
            guildEntry.greetings = greetings;
            guildEntry.greetingsMethod = "dm";
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, i updated the greetings");
        } else if ((channel !== -1) && (dm === -1) && (remove === -1)) {
            const greetings = message.content.substr(channel + 8);
            if (greetings === "") {
                return await message.channel.send(":x: You cannot set the greetings to nothing");
            }
            guildEntry.greetings = greetings;
            guildEntry.greetingsMethod = "channel";
            guildEntry.greetingsChan = message.channel.id;
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, i updated the greetings");
        } else if ((channel === -1) && (remove === -1) && (dm === -1)) {
            if (guildEntry.greetings === "") {
                return await message.channel.send(":x: There is not any greetings message");
            }
            var greetingsMsg;
            if (guildEntry.greetings.length > 1900) {
                greetingsMsg = guildEntry.greetings.substr(0, 1900) + "..."; //Just in case the greetings takes too much characters
            } else {
                greetingsMsg = guildEntry.greetings;
            }
            return await message.channel.send("The current greetings message is: ```" + greetingsMsg + "```");
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
    aliases: ["greetings"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'setgreetings',
    parameters: '`-remove`, `-dm`, `-channel`',
    description: 'Set the greetings message that Felix will send either in a channel or to the new member',
    usage: 'setgreetings -dm Welcome to our server !',
    category: 'settings',
    detailledUsage: '`{prefix}setgreetings -dm Welcome` Will send the message "Welcome" to every new members in their private messages\n`{prefix}setgreetings -channel Welcome` Will send the message "Welcome" to every new members in the channel you used the command\n`{prefix}setgreetings -remove` Will remove the greetings message.\nYou can use `{user}` and `{server}` to add the new member name and your server name in the message, so \n`{prefix}setgreetings -channel Welcome {user} to {server}`\n will look like: `Welcome @Baguette to Felix\'s lovers`\nYou can display the current greetings message by using `{prefix}setgreetings`'
};