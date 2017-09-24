module.exports = async(client, message, err) => {
    try {
        message.channel.send(":x: An error occurred");
    } catch (error) {
        err.replyAttempt = error;
    }
    err.triggerMessage = message.content;
    console.error(err);
    client.Raven.captureException(err);
}