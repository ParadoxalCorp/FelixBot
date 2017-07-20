const npm = require('npm-module-search');

exports.run = async(client, message) => {
    const args = message.content.substr(client.prefix.length + 4); //The prefix length + the npm command length and the following whitespace
    const searcOnNpm = "https://www.npmjs.com/search?q=" + args;
    const replaceWhitespace = searcOnNpm.replace(/\s/gi, "+");
    if (!args) {
        return await message.channel.send(":x: You must specify at least one argument");
    }
    try {
        const userMessage = message;
        await message.channel.send("Searching for the package " + args + "...").then(async(message) => {
            await npm.search(`${args}`, async function (err, modules) {
                if (modules[0] === undefined) {
                    return await message.edit(":x: Your search did not return any result");
                }
                var description;
                if (modules[0].description) {
                    description = modules[0].description;
                } else {
                    description = "None";
                }
                return await message.edit({
                    embed: {
                        color: 3447003,
                        author: {
                            name: "Requested by: " + userMessage.author.username + "#" + userMessage.author.discriminator,
                            icon_url: userMessage.author.avatarURL
                        },
                        title: "NPM",
                        url: "https://www.npmjs.com",
                        thumbnail: {
                            "url": "https://raw.githubusercontent.com/isaacs/npm/master/html/npm-256-square.png"
                        },
                        fields: [
                            {
                                name: "Package name",
                                value: `${modules[0].name}`,
                                inline: true
      },
                            {
                                name: "Version",
                                value: `${modules[0].version}`,
                                inline: true
      },
                            {
                                name: "Author",
                                value: `${modules[0].author}`,
                                inline: true
      },
                            {
                                name: "Description",
                                value: `${description}`,
                                inline: true
      },
                            {
                                name: "Link",
                                value: `[${args}](${replaceWhitespace})`,
                                inline: true
      }
    ],
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "NPM search"
                        }
                    }
                }).catch(console.error);
            })
        });
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
    name: 'npm',
    description: 'Search something through NPM',
    usage: 'npm express',
    category: 'utility'
};
