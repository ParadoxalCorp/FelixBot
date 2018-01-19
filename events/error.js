const logger = require(`../util/modules/logger.js`);

module.exports = async(client, err, message) => {
    if (client.config.raven) {
        let Raven = require("raven");
        Raven.config(client.config.raven).install();
        Raven.captureException(err, { triggerMessage: message ? message.content : undefined });
        logger.log(`${err} ${err ? (err.stack ? err.stack : '') : ''} | triggerMessage: ${message ? message.content : undefined}`, `error`);
    } else logger.log(`${err} ${err.stack} | triggerMessage: ${message ? message.content : undefined}`, `error`);
    if (message) {
        try {
            await message.channel.createMessage(`:x: An error occurred :v \nIf the issue persist, please check if i have enough permissions and don't hesitate to join the support server: <https://discord.gg/Ud49hQJ>`);
        } catch (err) {}
    }
}