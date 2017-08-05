const unirest = require("unirest");

exports.run = async(client, message) => {
    try {
        const userEntry = client.userDatas.get(message.author.id);
        const mentionned = message.mentions.users.first();
        if (!mentionned) {
            return await message.channel.send(":x: Please mention the user you want to love");
        } else if (mentionned) {
            if (message.author.id === mentionned.id) {
                return await message.channel.send(":x: You cant love yourself of course uwu");
            }
            fetch: {
                await unirest.get(`https://discordbots.org/api/bots/327144735359762432/votes?onlyids=true`)
                .header('Authorization', client.database.Data.global[0].discordBotList)
                .end(async function (result) {
                    const upvoters = result.body;
                    if (upvoters.indexOf(message.author.id) === -1) {
                        if ((userEntry.loveCooldown > Date.now()) && (userEntry.loveCooldown !== 0)) {
                            const now = new Date().getTime();
                            const distance = userEntry.loveCooldown - now;
                            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                            return await message.channel.send(":x: You can only use this command once, time remaining: " + hours + "h " + minutes + "m " + seconds + "s");
                        }
                        const mentionnedData = client.userDatas.get(mentionned.id);
                        mentionnedData.lovePoints++;
                        client.userDatas.set(mentionned.id, mentionnedData);
                        const ratelimit = Date.now() + 43200000; //current date + 12h (it use ms)
                        userEntry.loveCooldown = ratelimit;
                        client.userDatas.set(message.author.id, userEntry);
                        return await message.channel.send("You just gave 1 Love point to **" + mentionned.username + "#" + mentionned.discriminator + "**");
                    } else {
                        if ((userEntry.loveCooldown > Date.now()) && (userEntry.loveCooldown !== 0) && (userEntry.secondLoveCooldown > Date.now()) && (userEntry.secondLoveCooldown !== 0)) {
                            var nearest;
                            if (userEntry.loveCooldown > userEntry.secondLoveCooldown) {
                                nearest = userEntry.secondLoveCooldown;
                            } else {
                                nearest = userEntry.loveCooldown;
                            }
                            const now = new Date().getTime();
                            const distance = nearest - now;
                            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                            return await message.channel.send(":x: You can only use this command once, time remaining: " + hours + "h " + minutes + "m " + seconds + "s");
                        }
                        const mentionnedData = client.userDatas.get(mentionned.id);
                        mentionnedData.lovePoints++;
                        client.userDatas.set(mentionned.id, mentionnedData);
                        const ratelimit = Date.now() + 43200000; //current date + 12h (it use ms)
                        if (userEntry.loveCooldown > Date.now()) {
                            userEntry.secondLoveCooldown = ratelimit;
                        } else {
                            userEntry.loveCooldown = ratelimit;
                        }
                        var remainingPoints;
                        if ((userEntry.loveCooldown > Date.now() && userEntry.secondLoveCooldown < Date.now()) || (userEntry.secondLoveCooldown > Date.now() && userEntry.loveCooldown < Date.now())) {
                            remainingPoints = 1;
                        } else {
                            remainingPoints = 0;
                        }
                        client.userDatas.set(message.author.id, userEntry);
                        return await message.channel.send("You just gave 1 Love point to **" + mentionned.username + "#" + mentionned.discriminator + "**, love points remaining: " + remainingPoints);
                    }
                })
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
    aliases: ["luv"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'love',
    description: 'Love someone, bring some love to this world !',
    usage: 'love @someone',
    category: 'fun',
    detailledUsage: 'You can only use one love points every 12 hours, if you upvoted Felix on Discord Bot List, you get an extra love point'
};
