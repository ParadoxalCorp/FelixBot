module.exports = async(client, err, message) => {
    if (client.config.raven) {
        let Raven = require("raven");
        Raven.config(client.config.raven).install();
        Raven.captureException(err, { triggerMessage: message ? message.content : undefined });
    } else console.error(err, `triggerMessage: ${message ? message.content : undefined}`);
    if (message) {
        try {
            client.createMessage(message.channel.id, `:x: An error occurred`);
        } catch (err) {}
    }
}