const unirest = require('unirest');

exports.run = async(client, message) => {
    var args = message.content.substr(client.prefix.length + 4);
    var searcOnMdn = "https://developer.mozilla.org/en-US/search.json?locale=en-US&q=" + args;
    var linkToResults = "https://developer.mozilla.org/en-US/search?locale=en-US&q=" + args; //May be wew but kek
    var replaceWhitespace = searcOnMdn.replace(/\s/gi, "+");
    var legitReplaceWhitespace = linkToResults.replace(/\s/gi, "+");
    if (!args) {
        return message.channel.send(":x: You must specify at least one argument");
    }
    try {
        fetch: {
            await unirest.get(replaceWhitespace)
            .end(async function (result) {
                if (result.body.documents.length != 0) {
                    var firstResult = result.body.documents[0];
                    await message.channel.send({
                        embed: {
                            color: 3447003,
                            author: {
                                name: "Requested by: " + message.author.username + "#" + message.author.discriminator,
                                icon_url: message.author.avatarURL
                            },
                            title: "MDN",
                            url: "https://developer.mozilla.org/en/",
                            thumbnail: {
                                "url": "https://developer.cdn.mozilla.net/static/img/opengraph-logo.dc4e08e2f6af.png"
                            },
                            fields: [
                                {
                                    name: "Search results",
                                    value: "Here's the results for [" + args + "](" + legitReplaceWhitespace + ")."
      }, {
                                    name: "**" + firstResult.title + "**",
                                    value: firstResult.excerpt
      }
    ],
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "MDN search"
                            }
                        }
                    }).catch(console.error);
                } else {
                    return message.channel.send(":x: Your search did not returned any result");
                }
            })
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
    guildOnly: false,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'mdn',
    description: 'Search something through MDN',
    usage: 'mdn arrays',
    category: 'utility'
};
