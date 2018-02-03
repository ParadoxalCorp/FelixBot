class Modlog {
    constructor() {
        this.help = {
            name: 'modlog',
            usage: 'modlog set_channel <channel_name>',
            description: "Setup the mod-log channel, in which moderation actions (e.g ban, kick...) will be logged",
            detailedUsage: "Don't use any parameter like `{prefix}modlog` to quickly check which channel is set as the mod-log channel"
        }
        this.conf = {
            guildOnly: true
        }
        this.shortcut = {
            triggers: new Map([
                ['set_channel', {
                    script: 'setChannel.js',
                    help: 'Set the mod-log channel',
                    args: 1
                }],
                ['disable', {
                    script: 'disable.js',
                    help: 'Remove the mod-log channel'
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                resolve(await message.channel.createMessage(message.guild.channels.has(guildEntry.modLog.channel) ? `<#${guildEntry.modLog.channel}> is set as the mod-log channel` : ':x: There is no channel set as mod-log channel'));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Modlog();