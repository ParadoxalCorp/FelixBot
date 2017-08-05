const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const remove = client.searchForParameter(message, "remove");
        const whiteSpace = message.content.indexOf(" ");
        const guildEntry = client.guildDatas.get(message.guild.id);
        if (remove) {
            if (guildEntry.farewell === "") {
                return await message.channel.send(":x: There is not any farewell message");
            }
            guildEntry.farewell = "";
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, i removed the farewell message");
        } else if ((remove === -1) && (whiteSpace === -1)) { //Note: there is some useless conditions cuz there is returns everywhere but welp
            if (guildEntry.farewell === "") {
                return await message.channel.send(":x: There is not any farewell message");
            }
            var farewellMsg;
            if (guildEntry.farewell.length > 1900) {
                farewellMsg = guildEntry.farewell.substr(0, 1900) + "...";
            } else {
                farewellMsg = guildEntry.farewell;
            }
            return await message.channel.send("The current farewell message is: ```" + farewellMsg + "```");            
        } else if ((whiteSpace !== -1) && (remove)) {
            const farewellMsg = message.content.substr(whiteSpace + 1);
            if (farewellMsg === "") {
                return await message.channel.send(":x: You cannot set the farewell message to nothing");
            }
            guildEntry.farewell = farewellMsg;
            guildEntry.farewellChan = message.channel.id;
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, i updated the farewell message");
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
    aliases: ["farewell"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'setfarewell',
    parameters: '`-remove`',
    description: 'Set the farewell message that Felix will send in the current channel',
    usage: 'setfarewell A member left D:',
    category: 'settings',
    detailledUsage: 'You can use `{user}` and `{server}` to add the former member name and your server name in the message, so \n`{prefix}setfarewell {user} left {server}`\n will look like: `Baguette#0000 left Felix\'s lovers`\nYou can display the current farewell message by using `{prefix}setfarewell`\nUnlike the greetings, you cant send a farewell message in dm'
};