/** 
 * @param {Object} message The message object that triggered the command
 * @param {Object} params An object of parameters
 * @param {string} params.description - The description of the embed
 * @param {Array} params.content - An array of the contents
 * @param {Number} [params.limit=60000] - Optional: Time in milliseconds before the collector should end
 * @returns {Promise<Object>} An object with the endReason and collected properties
 */
async function createInteractiveMessage(message, params) {
    return new Promise(async(resolve, reject) => {
        if (!message || !params || !params.description || !params.content) return reject("Invalid createInteractiveMessage() call");
        let limit = params.limit || 60000;
        let client = message._client;
        let page = 0;
        const editMessage = function(page) {
            return {
                embed: {
                    title: params.title || ':gear: List',
                    description: params.description + "\n\n```\n" + params.content[page][0].join("\n") + "```",
                    footer: {
                        text: `Showing page ${page + 1}/${params.content.length} | Inactivity time limit: ${limit / 1000} seconds`
                    }
                }
            };
        }
        const interactiveMessage = await message.channel.createMessage(editMessage(page));
        const collector = interactiveMessage.createReactionCollector((reaction) => reaction.user.id === message.author.id);
        let pageReactions = ["◀", "▶", "❌"];
        for (let i = 0; i < pageReactions.length; i++) {
            await interactiveMessage.addReaction(pageReactions[i]);
        }
        let timeout = setTimeout(function() {
            collector.stop("timeout");
        }, limit);
        collector.on('collect', async(r) => {
            clearTimeout(timeout); //reset the timeout
            interactiveMessage.removeReaction(r.emoji.name, r.user.id);
            if (r.emoji.name === "◀") { //Move to previous page
                page = page === 0 ? page = params.content.length - 1 : page - 1
                await interactiveMessage.edit(editMessage(page));
            } else if (r.emoji.name === "▶") { //Move to next page
                page = page === params.content.length - 1 ? 0 : page + 1;
                await interactiveMessage.edit(editMessage(page));
            } else if (r.emoji.name === "❌") { //Abort the command
                clearTimeout(timeout); //Dont let the timeout continue any further, after all the command ended
                collector.stop("aborted"); //End the collector
            }
            timeout = setTimeout(async function() {
                collector.stop("timeout");
            }, limit); //Restart the timeout
        });
        collector.on('end', async(collected, reason) => { //On collector end
            interactiveMessage.delete();
            return resolve({
                endReason: reason,
                collected: collected
            });
        });
    });
}

module.exports = createInteractiveMessage;