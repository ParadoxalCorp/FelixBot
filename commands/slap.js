const unirest = require("unirest");

exports.run = async(client, message) => {
    try {
            fetch: {
                await unirest.get("https://staging-api.ram.moe/images/random?type=slap")
                .header(`Authorization`, `${client.database.Data.global[0].wolkeImageKey}`)
                .end(async function (result) {
                    var mentionned = message.mentions.users.first();
                    var slapUrl = result.body.url;
                    var randomnumber = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
                    if (mentionned) {
                        if (mentionned.id === message.author.id) {
                            return await message.channel.send("You slap yourself: Critical hit ! you lose **" + randomnumber + "** life points " + slapUrl);
                        }
                        var getvalueof = mentionned;
                        return await message.channel.send("** " + message.author.username + "** Just slapped **" + mentionned.username + "** " + slapUrl + "  :scream:");
                    } else {
                        return await message.channel.send("You slap yourself: Critical hit ! you lose **" + randomnumber + "** life points " + slapUrl);                        
                    }
                });
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'slap',
    description: 'Slap someone',
    usage: 'slap @someone',
    category: 'image'
};