const unirest = require("unirest");
exports.run = async(client, message) => {
        var whitespace = message.content.indexOf(" ");
        if (whitespace === -1) {
            return await message.channel.send(":x: The term you entered is not valid");
        }
        var term = message.content.substr(client.prefix.length + whitespace - client.prefix.length + 1); //kek
        try {
            fetch: {
                await unirest.get(`https://mashape-community-urban-dictionary.p.mashape.com/define?term=` + term)
                .header(`X-Mashape-Key`, `${client.database.Data.global[0].mashapeKey}`)
                .header(`Accept`, `text/plain`)
                .end(async function (result) {
                    if (result.body.list[0] != null) {
                        var urResult = result.body.list[0];
                        return await message.channel.send({
                            embed: {
                                author: {
                                    name: 'Urbandictionary',
                                    url: urResult.permalink
                                },
                                title: `Definition of ${term}`,
                                description: urResult.definition + "\n\n**Example**\n" + urResult.example,
                                footer: {
                                    text: `Wrote by: ${urResult.author}| 👍 ${urResult.thumbs_up}| 👎 ${urResult.thumbs_down}`
                                },
                                color: 0x00ADFF
                            }
                        });
                    } else {
                        return await message.channel.send(`:x: I could not find a definition for \`` + term + `\``);
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
    guildOnly: false,
    aliases: ["urdef", "define"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'urban',
    description: 'Search something through Urban Dictionary',
    usage: 'urban lols',
    category: 'fun'
};