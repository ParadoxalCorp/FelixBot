class Assign {
    constructor() {
        this.help = {
            name: 'assign',
            usage: 'assign <case_number>',
            description: 'Assign a moderation case to yourself'
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                let caseNumber = args.shift() - 1;
                if (!guildEntry.generalSettings.modLogChannel) return resolve(await message.channel.createMessage(`:x: There is no mod-log channel set`));
                if (!guildEntry.generalSettings.modLog[caseNumber]) return resolve(await message.channel.createMessage(`:x: Invalid case number`));
                let modCase = guildEntry.generalSettings.modLog[caseNumber];
                if (modCase.moderator) return resolve(await message.channel.createMessage(`:x: This moderation case is already assigned to \`${message.guild.members.has(modCase.moderator.id) 
                    ? message.guild.members.get(modCase.moderator.id).tag : modCase.moderator.tag}\` `));
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
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully assigned yourself to case \`#${caseNumber + 1}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Assign();