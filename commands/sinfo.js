const moment = require("moment");

exports.run = async(client, message) => {
    try {
        var embedFields = [];
        if (message.guild.verificationLevel === 0) {
            var verLevel = "None (0)";
        } else if (message.guild.verificationLevel === 1) {
            var verLevel = "Low (1)";
        } else if (message.guild.verificationLevel === 2) {
            var verLevel = "Medium (2)";
        } else if (message.guild.verificationLevel === 3) {
            var verLevel = "(╯°□°）╯︵ ┻━┻ (3)";
        } else if (message.guild.verificationLevel === 4) {
            var verLevel = "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ (4)";
        }
        embedFields.push({
            name: "Name",
            value: message.guild.name,
            inline: true
        });
        embedFields.push({
            name: "ID",
            value: message.guild.id,
            inline: true
        });
        embedFields.push({
            name: "Members",
            value: message.guild.memberCount,
            inline: true
        });
        embedFields.push({
            name: "Owner",
            value: message.guild.owner.user.username + "#" + message.guild.owner.user.discriminator,
            inline: true
        })
        if (message.guild.defaultChannel) {
            embedFields.push({
                name: "Default channel",
                value: "#" + message.guild.defaultChannel.name,
                inline: true
            });
        }
        embedFields.push({
            name: "Created",
            value: moment().to(message.guild.createdAt),
            inline: true
        });
        embedFields.push({
            name: "Channels",
            value: message.guild.channels.size,
            inline: true
        });
        embedFields.push({
            name: "Roles",
            value: message.guild.roles.size,
            inline: true
        });
        embedFields.push({
            name: "Verification level",
            value: verLevel,
            inline: true
        });
        embedFields.push({
            name: "Region",
            value: message.guild.region,
            inline: true
        });
        return await message.channel.send({
            embed: {
                thumbnail: {
                    url: message.guild.iconURL
                },
                color: 3447003,
                author: {
                    name: "Requested by: " + message.author.username + "#" + message.author.discriminator,
                    icon_url: message.author.avatarURL
                },
                title: "Server info",
                fields: embedFields,
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: message.guild.name
                }
            }
        }).catch(console.error);
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
    aliases: ["serverinfo"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'sinfo',
    description: 'Display some infos about the server you are in',
    usage: 'sinfo',
    category: 'generic'
};
