//Stolen from Tweetcord (https://github.com/Aetheryx/tweetcord) the 20/03/18
//With some JSDoc added cuz its useful kek

/**
 * A message collector which does not create a new event listener each collectors, but rather only use one added when its instantiated
 * @prop {object} collectors An object representing all the ongoing collectors
 */
class MessageCollector {
    /**
     * Instantiating this class create a new messageCreate listener, which will be used for all calls to awaitMessage
     * @param {*} bot - The eris bot instance
     */
    constructor(bot) {
        this.collectors = {};

        bot.on('messageCreate', this.verify.bind(this));
    }

    /**
     * Verify if the message pass the condition of the filter function
     * @param {*} msg The message to verify
     * @returns {void} 
     * @private
     */
    async verify(msg) {
        const collector = this.collectors[msg.channel.id + msg.author.id];
        if (collector && collector.filter(msg)) {
            collector.resolve(msg);
        }
    }

    /**
     * Await a message from the specified user in the specified channel
     * @param {object} channelID - The ID of the channel to await a message in
     * @param {object} userID - The ID of the user to await a message from
     * @param {number} [timeout=60000] - Time in milliseconds before the collect should be aborted
     * @param {function} [filter] - A function that will be tested against the messages of the user, by default always resolve to true
     * @returns {Promise<Message>} The message, or false if the timeout has elapsed
     */
    awaitMessage(channelID, userID, timeout = 60000, filter = () => true) {
        return new Promise(resolve => {
            if (this.collectors[channelID + userID]) {
                delete this.collectors[channelID + userID];
            }

            this.collectors[channelID + userID] = { resolve, filter };

            setTimeout(resolve.bind(null, false), timeout);
        });
    }
}

module.exports = MessageCollector;