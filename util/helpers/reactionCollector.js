/**
 * A reaction collector which does not create a new event listener each collectors, but rather only use one added when its instantiated
 * @prop {object} collectors An object representing all the ongoing collectors
 */
class reactionCollector {
    /**
     * Instantiating this class create a new messageReactionAdd listener, which will be used for all calls to awaitReaction
     * @param {*} bot - The eris bot instance
     */
    constructor(bot) {
        this.collectors = {};

        bot.on('messageReactionAdd', this.verify.bind(this));
    }

    /**
     * Verify if the reaction pass the condition of the filter function
     * @param {*} msg - The message
     * @param {object} emoji - The emoji
     * @param {string} userID - the ID of the user
     * @returns {void} 
     * @private
     */
    async verify(msg, emoji, userID) {
        const collector = this.collectors[msg.channel.id + msg.id + userID];
        if (collector && collector.filter(msg, emoji, userID)) {
            collector.resolve({
                message: msg,
                emoji: emoji,
                userID: userID
            });
        }
    }

    /**
     * Await a reaction from the specified user in the specified channel
     * @param {object} channelID - The ID of the channel to await a reaction in
     * @param {object} messageID - The ID of the message to await a reaction on
     * @param {object} userID - The ID of the user to await a reaction from
     * @param {number} [timeout=60000] - Time in milliseconds before the collect should be aborted
     * @param {function} [filter] - A function that will be tested against the reactions of the user, by default always resolve to true
     * @returns {Promise<{message: message, emoji: {name: string, id: string, animated: boolean}, userID: string}>} An object with the message, emoji and userID properties, or false if the timeout has elapsed
     */
    awaitReaction(channelID, messageID, userID, timeout = 60000, filter = () => true) {
        return new Promise(resolve => {
            if (this.collectors[channelID + messageID + userID]) {
                delete this.collectors[channelID + messageID + userID];
            }

            this.collectors[channelID + messageID + userID] = { resolve, filter };

            setTimeout(resolve.bind(null, false), timeout);
        });
    }
}

module.exports = reactionCollector;