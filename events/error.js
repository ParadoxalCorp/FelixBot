const logger = require(`../util/modules/logger.js`);

module.exports = async(client, err, message) => {
    try {
        //Ignore all kinds of missing permissions errors (and unknown message case, oh and the 2FA needed error too, cuz somehow it happen) for sentry
        if (client.config.raven && !['50001', '50007', '50013', '10008', '60003'].filter(c => err && err.message && err.message.includes(c))[0]) {
            let Raven = require("raven");
            Raven.config(client.config.raven, {
                release: client.coreData.version
            }).install();
            Raven.captureException(err, {
                extra: {
                    message: message ? message.content : 'None',
                    guild: message && message.guild ? `${message.guild.id} | ${message.guild.name}` : 'None'
                }
            });
        }
        logger.log(`${err ? (err.stack ? err.stack : err) : 'Undefined error'} \nGuild: ${message && message.guild ? message.guild.id + ' | ' + message.guild.name : 'None'} \ntriggerMessage: ${message ? message.content : 'None'}`, `error`);
        if (message) {
            message.channel.createMessage({
                embed: {
                    title: ':x: An error occurred :v',
                    description: `If the issue persist, this is most likely because i miss permissions to do this.\n\nIf however even with enough permissions the issue still exist, don't hesitate to join the [support server](<https://discord.gg/Ud49hQJ>)`
                }
            }).catch();
        }
    } catch (err) {
        logger.log(`A critical error occurred within the error handler: ${err.stack}`, 'error');
    }
}