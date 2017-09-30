exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            function convertToRemainingTime(timestamp) {
                return {
                    hours: Math.floor((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((timestamp % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((timestamp % (1000 * 60)) / 1000)
                }
            }
            let embedFields = [];
            if (client.upvotes.latestUpdate) {
                let upvoteSuccess = ":x:";
                let nextUpdate = convertToRemainingTime((client.upvotes.latestUpdate + 1800000) - Date.now()); //+30Mins(interval between updates)
                if (client.upvotes.users) upvoteSuccess = ":white_check_mark:"
                embedFields.push({
                    name: 'Upvotes update',
                    value: `**Success**: ${upvoteSuccess}\n**Latest update**: ${new Date(client.upvotes.latestUpdate)}\n**Next update in**: ${nextUpdate.minutes}m ${nextUpdate.seconds}s`,
                    inline: true
                });
            }
            let latestUpdateDate = ':x:';
            if (client.statsUpdate.latestUpdate) latestUpdateDate = new Date(client.statsUpdate.latestUpdate);
            embedFields.push({
                name: 'Discord Bot List stats',
                value: `**Update status**: ${client.statsUpdate.success.description()}\n**Latest update**: ${latestUpdateDate}`,
                inline: true
            });
            embedFields.push({
                name: 'Uptime',
                value: `${((client.uptime / (1000*60*60)) % 24).toFixed(1)}h ${Math.round((client.uptime / (1000*60)) % 60)}m ${Math.round((client.uptime / 1000) % 60)}s`,
                inline: true
            });
            latestUpdateDate = ':x:';
            if (client.imageTypes.latestUpdate) latestUpdateDate = new Date(client.imageTypes.latestUpdate);
            let nextUpdate = convertToRemainingTime((client.imageTypes.latestUpdate + 43200000) - Date.now()); //+12h (interval between updates)
            embedFields.push({
                name: 'Image types update',
                value: `**Success**: ${client.imageTypes.success.description()}\n**Latest update**: ${new Date(client.imageTypes.latestUpdate)}\n**Next update in**: ${nextUpdate.hours}h ${nextUpdate.minutes}m ${nextUpdate.seconds}s`,
                inline: true
            });
            return resolve(await message.channel.send({
                embed: {
                    title: 'Run stats',
                    fields: embedFields
                }
            }));
        } catch (err) {
            client.emit('commandFail', message, err);
        }
    });
}
exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false
}
exports.help = {
    name: 'runinfo',
    description: 'Some stats about the current run',
    usage: 'runinfo',
    category: 'admin'
}