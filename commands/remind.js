exports.run = async(client, message) => {
    try {
        var userEntry = client.userDatas.get(message.author.id);
        if (!userEntry.reminders) {
            userEntry.reminders = [];
        }
        if (!userEntry.id) {
            userEntry.id = message.author.id;
        }
        var args = message.content.split(/\s+/);
        args.shift();
        if (args.length === 0) { //---------------------------------------------reminders list-------------------------------------------------------
            if (userEntry.reminders.length === 0) {
                return await message.channel.send(":x: You dont have any active reminders");
            }
            var page = 0;
            const interactiveMessage = await message.channel.send({
                embed: {
                    title: ":gear: Reminders",
                    description: "This is the list of your reminders, use :wastebasket: to delete one, :x: to quit this command and the arrows to move through pages",
                    fields: [{
                        name: ":notepad_spiral: Content",
                        value: `${userEntry.reminders[0].cleanText}`,
                        inline: true
                    }, {
                        name: ":calendar: At",
                        value: `${new Date(userEntry.reminders[0].timestamp).toGMTString()}`,
                        inline: true
                    }],
                    footer: {
                        text: `Showing page ${page + 1}/${userEntry.reminders.length}`
                    }
                }
            });
            await interactiveMessage.react("⏮");
            await interactiveMessage.react("◀");
            await interactiveMessage.react("▶");
            await interactiveMessage.react("⏭");
            await interactiveMessage.react("🗑");
            await interactiveMessage.react("❌");
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            var timeout = setTimeout(async function () {
                collector.stop("Timeout");
                return await interactiveMessage.delete();
            }, 120000);
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //Reset the countdown
                if (r.emoji.name === "⏮") { //-----------------Move to the first page
                    if (page !== 0) {
                        page = 0;
                        interactiveMessage.edit({
                            embed: {
                                title: ":gear: Reminders",
                                description: "This is the list of your reminders, use :wastebasket: to delete one, :x: to quit this command and the arrows to move through pages",
                                fields: [{
                                    name: ":notepad_spiral: Content",
                                    value: `${userEntry.reminders[page].cleanText}`,
                                    inline: true
                    }, {
                                    name: ":calendar: At",
                                    value: `${new Date(userEntry.reminders[page].timestamp).toGMTString()}`,
                                    inline: true
                    }],
                                footer: {
                                    text: `Showing page ${page + 1}/${userEntry.reminders.length}`
                                }
                            }
                        });
                    }
                } else if (r.emoji.name === "◀") { //----------------------Move to the previous page
                    if (page === 0) {
                        page = userEntry.reminders.length - 1;
                    } else {
                        page = page - 1;
                    }
                    interactiveMessage.edit({
                        embed: {
                            title: ":gear: Reminders",
                            description: "This is the list of your reminders, use :wastebasket: to delete one, :x: to quit this command and the arrows to move through pages",
                            fields: [{
                                name: ":notepad_spiral: Content",
                                value: `${userEntry.reminders[page].cleanText}`,
                                inline: true
                    }, {
                                name: ":calendar: At",
                                value: `${new Date(userEntry.reminders[page].timestamp).toGMTString()}`,
                                inline: true
                    }],
                            footer: {
                                text: `Showing page ${page + 1}/${userEntry.reminders.length}`
                            }
                        }
                    });
                } else if (r.emoji.name === "▶") { //--------------Move to the next page
                    if (page === userEntry.reminders.length - 1) {
                        page = 0;
                    } else {
                        page = page + 1;
                    }
                    interactiveMessage.edit({
                        embed: {
                            title: ":gear: Reminders",
                            description: "This is the list of your reminders, use :wastebasket: to delete one, :x: to quit this command and the arrows to move through pages",
                            fields: [{
                                name: ":notepad_spiral: Content",
                                value: `${userEntry.reminders[page].cleanText}`,
                                inline: true
                    }, {
                                name: ":calendar: At",
                                value: `${new Date(userEntry.reminders[page].timestamp).toGMTString()}`,
                                inline: true
                    }],
                            footer: {
                                text: `Showing page ${page + 1}/${userEntry.reminders.length}`
                            }
                        }
                    });
                } else if (r.emoji.name === "⏭") { //----------------Move to the last page
                    if (page !== userEntry.reminders.length - 1) {
                        page = userEntry.reminders.length - 1;
                        interactiveMessage.edit({
                            embed: {
                                title: ":gear: Reminders",
                                description: "This is the list of your reminders, use :wastebasket: to delete one, :x: to quit this command and the arrows to move through pages",
                                fields: [{
                                    name: ":notepad_spiral: Content",
                                    value: `${userEntry.reminders[page].cleanText}`,
                                    inline: true
                    }, {
                                    name: ":calendar: At",
                                    value: `${new Date(userEntry.reminders[page].timestamp).toGMTString()}`,
                                    inline: true
                    }],
                                footer: {
                                    text: `Showing page ${page + 1}/${userEntry.reminders.length}`
                                }
                            }
                        });
                    }
                } else if (r.emoji.name === "🗑") { //-----------------Delete the current reminder
                    userEntry.reminders.splice(page, 1);
                    client.userDatas.set(message.author.id, userEntry);
                    if (page === userEntry.reminders.length) {
                        page = userEntry.reminders.length - 1;
                    }
                    if (userEntry.reminders.length === 0) { //If there is nothing left
                        return await interactiveMessage.delete();
                    }
                    interactiveMessage.edit({
                        embed: {
                            title: ":gear: Reminders",
                            description: "This is the list of your reminders, use :wastebasket: to delete one, :x: to quit this command and the arrows to move through pages",
                            fields: [{
                                name: ":notepad_spiral: Content",
                                value: `${userEntry.reminders[page].cleanText}`,
                                inline: true
                    }, {
                                name: ":calendar: At",
                                value: `${new Date(userEntry.reminders[page].timestamp).toGMTString()}`,
                                inline: true
                    }],
                            footer: {
                                text: `Showing page ${page + 1}/${userEntry.reminders.length}`
                            }
                        }
                    }); //
                } else if (r.emoji.name === "❌") { //-------------Close the command
                    collector.stop("User aborted the process");
                    return await interactiveMessage.delete();
                }
                await r.remove(message.author.id); //Remove the user reaction
                //Start a new countdown
                timeout = setTimeout(async function () {
                    collector.stop("Timeout");
                    return await interactiveMessage.delete();
                }, 120000);
            });
        } else { //------------------------------------Add reminders-------------------------------------------------------------
            if (args.toString().length > 256) {
                return await message.channel.send(":x: Your message can't exceed 256 characters :v");
            }
            const witReply = await client.wit.message(args.join(" "));
            if (!witReply.entities) {
                console.error(witReply);
                return await message.channel.send(":x: An error occured with Wit's API");
            }
            if (!witReply.entities.datetime && !witReply.entities.duration) {
                return await message.channel.send(":x: I couldn't find any time indicator :v");
            }
            if (witReply.entities.datetime && witReply.entities.duration) {
                return await message.channel.send(":x: Sorry but you cant use both a datetime and a duration");
            }
            var total = 0;
            var humanDate;
            var countdown;
            if (witReply.entities.datetime) { //--------------------Datetime-----------------------
                var mutliResults = [];
                witReply.entities.datetime.forEach(function (date) {
                    if (date.value === "Invalid Date") {
                        return mutliResults = false;
                    }
                    mutliResults.push(new Date(date.value).getTime());
                });
                if (!mutliResults) {
                    return await message.channel.send(":x: Invalid date");
                }
                if (mutliResults.length > 1) { //Cuz sometimes wit return more than one element
                    var sorted = mutliResults.sort(function (a, b) {
                        return a - b;
                    });
                    sorted.reverse();
                    for (let i = 0; i < sorted.length; i++) {
                        if (i === 0) {
                            total = sorted[0] - Date.now();
                        } else {
                            total = total + ((sorted[i] - Date.now()) - total);
                        }
                    }
                } else {
                    total = mutliResults[0] - Date.now();
                    countdown = total;
                }               
                humanDate = new Date(Date.now() + total).toGMTString();
            } else if (witReply.entities.duration) {//----------------------------------Duration------------------------------------
                witReply.entities.duration.forEach(function (duration) { //Thats seriously all thanks to wit gorgeous api
                    total = total + duration.normalized.value;
                });
                humanDate = new Date(Date.now() + (total * 1000)).toGMTString();
                countdown = total * 1000;
            }
            if (Date.now() + countdown < Date.now()) {
                return await message.channel.send(":x: I would love to but i can't go back in time to remind you that :v");
            }
            var cleanText = args.join(" ");
            var reminderId = Math.floor(Math.random() * (999999999999 - 100000000000 + 1)) + 100000000000;
            userEntry.reminders.push({
                text: message.content,
                cleanText: cleanText,
                timestamp: Date.now() + countdown,
                id: reminderId
            });
            client.userDatas.set(message.author.id, userEntry);
            setTimeout(async function () {
                userEntry = client.userDatas.get(message.author.id); //"Refresh" the variable
                if (client.findReminder(message.author.id, reminderId) === -1) {
                    console.log(userEntry.reminders);                    
                    return;
                }
                try {
                    const reminderPos = client.findReminder(message.author.id, reminderId);
                    await client.users.get(message.author.id).send("Hey, you wanted me to remind you about ```\n" + userEntry.reminders[reminderPos].cleanText + "```");
                    userEntry.reminders.splice(reminderPos, 1); //Delete the expired reminder
                    client.userDatas.set(message.author.id, userEntry);
                } catch (err) {
                    console.error(err);
                }
            }, countdown);
            console.log(reminderId);            
            return await message.channel.send("Alright, i will remind you about it at **" + humanDate + "**");
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
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["remindme", "reminds", "reminders"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'remind',
    description: 'Set your reminders',
    usage: 'remind run some errands in 10h',
    category: 'miscellaneous',
    detailledUsage: 'Use `{prefix}remind` to get the list of your active reminders. This command use Wit.ai\'s API, so there is different ways to set a reminder, for example: \n**Using durations**\n`{prefix}remind buy 3 baguettes in 2 hours` Will set a reminder which will occur in 2 hours\n`{prefix}remind in 2 hours buy 3 baguettes` Will do the same thing and \n`{prefix}remind remind me about it in an hour` will set the reminder to occur in one hour\n**days, weeks, hours, seconds, minutes are supported** so for example: \n`{prefix}remind uwu in 3 days 2 hours 22mins and 3sec` Will actually work\n**Using datetime**\n`{prefix}remind wake up tomorrow` Will set a reminder for midnight\n`{prefix}datetime eat dinner at 8PM` Will set a reminder for today at 8PM\n*Note:* Its not possible to use both datetime and duration'
};
