const logger = require(`../util/modules/logger.js`);

module.exports = async(client, err, message) => {
    if ((err && err.code && err.code == 10008) || err.includes("404 NOT FOUND")) return; //Unknown messages error code, honestly fuck these errors
    if (client.config.raven) {
        let Raven = require("raven");
        Raven.config(client.config.raven).install();
        Raven.captureException(err, { triggerMessage: message ? message.content : undefined });
    } else logger.log(`${err} ${err.stack} | triggerMessage: ${message ? message.content : undefined}`, `error`);
    if (message) {
        try {
            message.channel.createMessage(`:x: An error occurred`);
        } catch (err) {}
    }
}