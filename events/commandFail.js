module.exports = async(client, message, err) => {
    try {
        let error = err.code === 50013 ? `:x: An error occurred(missing permissions)` : `:x: An error occurred`;
        message.channel.send(error);
    } catch (error) {
        err.replyAttempt = error;
    }
    err.triggerMessage = message.content;
    console.error(err);
    client.Raven.captureException(err);
}