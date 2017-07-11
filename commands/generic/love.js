exports.run = async(client, message) => {
    try {
        const mentionned = message.mentions.users.first();
        if (!mentionned) {
            return await message.channel.send(":x: Please mention the user you want to love");
        } else if (mentionned) {
            if (message.author.id === mentionned.id) {
                return await message.channel.send(":x: You cant love yourself of course uwu");
            }
            if (!client.database.Data.users[0][mentionned.id]) { //If the mentionned user is not in the db yet, just in case
                database.Data.users[0][message.author.id] = {
                    lovePoints: "0",
                    loveCooldown: "0",
                    malAccount: ""
                }
            } 
            if ((lovePoints[message.author.id].ratelimit > Date.now()) && (lovePoints[message.author.id].ratelimit !== 0)) {
                const now = new Date().getTime();
                const distance = lovePoints[message.author.id].ratelimit - now;
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                return await message.channel.send(":x: You can only use this command once, time remaining: " + hours + "h " + minutes + "m " + seconds + "s");
            }
            let mentionnedData = client.database.Data.users[0][mentionned.id];
            mentionnedData.lovePoints++;
            var ratelimit = Date.now() + 43200000; //current date + 12h (it use ms)
            client.database.Data.users[0][message.author.id].loveCooldown = ratelimit;
            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                if (err) console.error(err)
            });
            return await message.channel.send("You just gave 1 Love point to **" + mentionned.username + "#" + mentionned.discriminator + "**");
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
    category: 'fun'
};
