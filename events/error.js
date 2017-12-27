const logger = require(`../util/modules/logger.js`);

module.exports = async(client, err, message) => {
    if (client.config.raven) {
        let Raven = require("raven");
        Raven.config(client.config.raven).install();
        Raven.captureException(err, { triggerMessage: message ? message.content : undefined });
        logger.log(`${err} ${err.stack} | triggerMessage: ${message ? message.content : undefined}`, `error`);
    } else logger.log(`${err} ${err.stack} | triggerMessage: ${message ? message.content : undefined}`, `error`);
    if (message) {
        try {
            message.channel.createMessage(`:x: An error occurred`);
        } catch (err) {}
    }
}