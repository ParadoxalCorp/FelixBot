const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const bug = message.content.indexOf("-bug");
        const request = message.content.indexOf("-request");
        const userEntry = client.userDatas.get(message.author.id);
        if ((userEntry.feedbackCooldown > Date.now()) && (userEntry.feedbackCooldown !== 0)) {
            const now = new Date().getTime();
            const distance = client.database.Data.users[0][message.author.id].feedbackCooldown - now;
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            return await message.channel.send(":x: You can only use this command once, time remaining: " + hours + "h " + minutes + "m " + seconds + "s");
        }
        var feedbackContent = `**Author:** ${message.author.username} (ID: ${message.author.id})\n**Message:** `;
        if ((bug !== -1) && (request === -1)) {
            const content = message.content.substr(bug + 5);
            if (content === "") {
                return await message.channel.send(":x: You cannot send an empty bug report");
            }
            feedbackContent += content;
            await client.channels.get(client.bugChan).send(feedbackContent);
            userEntry.feedbackCooldown = Date.now() + 86400000; //current timestamp + 24h 
            client.userDatas.set(message.author.id, userEntry);
            return await message.channel.send(":white_check_mark: Alright, i sent your bug report");
        } else if ((request !== -1) && (bug === -1)) {
            const content = message.content.substr(request + 9);
            if (content === "") {
                return await message.channel.send(":x: You cannot send an empty feature request");
            }
            feedbackContent += content;
            await client.channels.get(client.featureChan).send(feedbackContent);
            userEntry.feedbackCooldown = Date.now() + 86400000; //current timestamp + 24h 
            client.userDatas.set(message.author.id, userEntry);
            return await message.channel.send(":white_check_mark: Alright, i sent your feature request");
        } else if ((request === -1) && (bug === -1)) {
            return await message.channel.send(":x: You did not used any parameters, use `" + client.prefix + "help " + client.commands.get(this.help.name).help.name + "` to learn more about this command usage");
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
    guildOnly: false,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'feedback',
    parameters: '`-bug`, `-request`',
    description: 'Send a bug report or a feature-request to my developper, the usage is limited to 1 time every 24h',
    usage: 'feedback -bug this is a bug report, fix pls',
    category: 'miscellaneous',
    detailledUsage: '**Warning:** In order to avoid spam, you can use this command once a day, so you cant send a bug report and a feature request the same day. But you can send both in one bug report or one request, there is no problem with that'
};
