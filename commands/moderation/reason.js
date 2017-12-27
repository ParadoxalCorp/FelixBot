class Reason {
    constructor() {
        this.help = {
            name: "reason",
            usage: "reason <case_number> <reason>",
            description: "Add or edit the reason of a moderation action logged in the mod-log channel"
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                if (!guildEntry.generalSettings.modLogChannel) return resolve(await message.channel.createMessage(`:x: There is no mod-log channel set`));
                let caseNumber = args.shift() - 1,
                    reason = args.join(" ");
                if (!guildEntry.generalSettings.modLog[caseNumber]) return resolve(await message.channel.createMessage(`:x: Invalid case number`));
                if (!reason) return resolve(await message.channel.createMessage(`:x: The reason can't be blank`));
                let modCase = guildEntry.generalSettings.modLog[caseNumber];
                if (modCase.moderator && modCase.moderator.id !== message.author.id) {
                    return resolve(await message.channel.createMessage(`:x: This case is assigned to \`${message.guild.members.has(modCase.moderator.id) 
                        ? message.guild.members.get(modCase.moderator.id).tag : modCase.moderator.tag}\` and therefore only them can edit the reason`));
                }
                guildEntry.generalSettings.modLog[caseNumber].reason = reason;
                guildEntry.generalSettings.modLog[caseNumber].moderator = {
                    id: message.author.id,
                    username: message.author.username,
                    tag: message.author.tag,
                    discriminator: message.author.discriminator
                };
                let logMessageExist = await client.getMessage(guildEntry.generalSettings.modLogChannel, modCase.modLogMessage).catch(err => false);
                let updatedModCase = {
                    embed: {
                        title: `Case #${caseNumber + 1}`,
                        color: modCase.color,
                        fields: [{
                            name: "User",
                            value: `${modCase.user.tag} (${modCase.user.id})`,
                            inline: true
                        }, {
                            name: "Moderator",
                            value: `${modCase.moderator.tag} (<@${modCase.moderator.id}>)`,
                            inline: true
                        }, {
                            name: "Action",
                            value: `Has been ${modCase.performedAction}`
                        }, {
                            name: "Reason",
                            value: modCase.reason,
                        }],
                        timestamp: new Date(modCase.timestamp).toISOString()
                    }
                }
                if (logMessageExist) {
                    await client.editMessage(guildEntry.generalSettings.modLogChannel, modCase.modLogMessage, updatedModCase);
                } else await client.createMessage(guildEntry.generalSettings.modLogChannel, updatedModCase);
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully updated the reason of case \`#${caseNumber + 1}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Reason();