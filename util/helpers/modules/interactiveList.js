'use strict';

/**
 * Provides methods to create an "interactive list" message, basically a message with "pages" 
 * @prop {object} client - The client given in the constructor
 */
class InteractiveList {
    /**
     * @param {object} client - The client instance
     */
    constructor(client) {
        this.client = client;
        this.ongoingList = new client.collection();
    }

    /**
     * Create a paginated message
     * @param {object} params - An object of parameters
     * @param {object} params.channel - The channel where to create the message
     * @param {array} params.messages - An array of messages (string or objects), each will represent a page (every {index} instance in strings will be replaced by the current page)
     * @param {string} params.userID - The ID of the user to wait reactions from
     * @param {function} [params.filter] - An optional filter function that will be passed to the reaction collector
     * @param {number} [params.timeout=60000] - Time of inactivity in milliseconds before this should be aborted, default is 60000
     * @param {array} [params.reactions] - Additional array of {unicode: reaction, callback: callback()} objects
     * @returns {Promise<void>} - Returns a promise with no particular value
     */
    async createPaginatedMessage(params) {
        const paginatedMessages = this._replacePageTags(params.messages);
        const reactions = params.reactions ? ['◀', '▶', ...params.reactions.map(r => r.unicode), '❌'] : ['◀', '▶', '❌'];
        const message = await params.channel.createMessage(paginatedMessages[0]);
        for (const reaction of reactions) {
            await message.addReaction(reaction);
        }
        let page = 0;

        this.ongoingList.set(`${message.timestamp}/${params.userID}`, true);
        message.exit = () => {
            message.delete().catch(() => {});
            this.ongoingList.delete(`${message.timestamp}/${params.userID}`);
        };
        this.client.reactionCollector.awaitReaction(params.channel.id, message.id, params.userID, params.timeout, params.filter)
            .then(r => {
                return this._handleReaction(params, r, page, message, paginatedMessages);
            });
    }

    /**
     * 
     * @param {array} messages - An array of messages to replace the page tags from
     * @returns {array} - The messages with their page tags replaced
     */
    _replacePageTags(messages) {
        const index = new RegExp(/{index}/gim);
        let page = 1;
        messages = messages.map(message => {
            if (typeof message === "object") {
                message = this.client.traverse(message, (value) => {
                    if (Array.isArray(value)) {
                        value = value.map(field => {
                            if (typeof field.value === "number") {
                                field.value = `${field.value}`;
                            }
                            field.name = field.name.replace(index, page);
                            field.value = field.value.replace(index, page);
                            return field;
                        });
                    } else {
                        if (typeof value === 'string') {
                            value = value.replace(index, page);
                        }
                    }
                    return value;
                }, ["item"]);
            } else {
                message = message.replace(index, page);
            }
            page++;
            return message;
        });

        return messages;
    }

    /**
     * 
     * @param {object} params - The object of parameters
     * @param {object} reaction - The reaction object given by the reaction collector
     * @param {number} page - The current page
     * @param {object} message - The message
     * @param {array} paginatedMessages - The messages with replaced page tags
     * @private
     * @returns {Promise<void>} Returns a promise with no particular value
     */
    async _handleReaction(params, reaction, page, message, paginatedMessages) {
        reaction ? message.removeReaction(reaction.emoji.name, params.userID).catch(() => {}) : 'baguette';
        if (!reaction) {
            message.delete().catch(() => {});
            return;
        } else if (reaction.emoji.name === '◀') {
            page = page === 0 ? paginatedMessages.length - 1 : page - 1;
            await message.edit(paginatedMessages[page]);
            return this.client.reactionCollector.awaitReaction(params.channel.id, message.id, params.userID, params.timeout, params.filter)
                .then(r => this._handleReaction(params, r, page, message, paginatedMessages));
        } else if (reaction.emoji.name === '▶') {
            page = page === paginatedMessages.length - 1 ? 0 : page + 1;
            await message.edit(paginatedMessages[page]);
            return this.client.reactionCollector.awaitReaction(params.channel.id, message.id, params.userID, params.timeout, params.filter)
                .then(r => this._handleReaction(params, r, page, message, paginatedMessages));
        } else if (reaction.emoji.name === '❌') {
            message.exit();
            return;
        } else if (params.reactions && params.reactions.map(r => r.unicode).includes(reaction.emoji.name)) {
            await params.reactions.find(r => r.unicode === reaction.emoji.name).callback(message, params.messages[page], reaction);
            if (!this.ongoingList.get(`${message.timestamp}/${params.userID}`)) {
                return;
            }
            return this.client.reactionCollector.awaitReaction(params.channel.id, message.id, params.userID, params.timeout, params.filter)
                .then(r => this._handleReaction(params, r, page, message, paginatedMessages));
        }
    }
}

module.exports = InteractiveList;