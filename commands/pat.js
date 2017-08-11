const unirest = require("unirest");

exports.run = async(client, message) => {
    try {
        fetch: {
            await unirest.get("https://staging.weeb.sh/images/random?type=pat")
            .header(`Authorization`, `Bearer ${client.database.Data.global[0].wolkeImageKey}`)
            .end(async function (result) {
                var mentionned = message.mentions.users.first();
                var patUrl = result.body.url;
                if (mentionned) {
                    if (mentionned.id === message.author.id) {
                        return await message.channel.send(":x: You cant pat yourself .-.");
                    }
                    var mentionnedPeoples;
                    const mentions = message.mentions.users.array();
                    mentions.forEach(function (mention) {
                        mentionnedPeoples += mention.username + ", "
                        mentionnedPeoples = mentionnedPeoples.replace(/undefined/gm, ""); //get rid of the undefined cuz i dont know where it come from
                    });
                    await message.channel.send("Hey **" + mentionnedPeoples + "** You just received a pat from **" + message.author.username + "** " + patUrl);
                } else {
                    await message.channel.send("Are you trying to pat yourself? >_>")
                }
            });
        }
    }
    catch (err) {
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'pat',
    description: 'pat someone',
    usage: 'pat @someone',
    category: 'image'
};
