module.exports = async(client, message) => {
    /**
     * 
     * 
     * @param {Object} message The message object that triggered the command
     * @param {Object} params An object of parameters
     * @param {string} params.description - The description of the embed
     * @param {Array} params.content - An array of the contents
     * @param {Boolean} [params.deletion=false] - Optional: Whether or not the elements can be "deleted" by the user
     * @param {Number} [params.limit=60000] - Optional: Time in milliseconds before the collector should end
     * @returns {Promise<Object>} An object with the endReason and collected properties
     */
    async function createInteractiveMessage(message, params) {
        return new Promise(async(resolve, reject) => {
            if (!message || !params || !params.description || !params.content) return reject("Invalid call: Please refer to the docs to see the required parameters of createInteractiveMessage()");
            let limit = params.limit || 60000;
            const interactiveMessage = await message.channel.send({
                embed: {
                    title: params.title || ':gear: List',
                    description: params.description + "\n\n```\n" + params.content[0].join("\n") + "```",
                    footer: {
                        text: `Showing page 1/${params.content.length} | Inactivity time limit: ${limit / 1000} seconds`
                    }
                }
            });
            const editMessage = async function(page) {
                interactiveMessage.edit({
                    embed: {
                        title: params.title || ':gear: List',
                        description: params.description + "\n\n```\n" + params.content[page].join("\n") + "```",
                        footer: {
                            text: `Showing page ${page + 1}/${params.content.length} | Inactivity time limit: ${limit / 1000} seconds`
                        }
                    }
                })
            }
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            let pageReactions = ["⏮", "◀", "▶", "⏭", "❌"];
            if (params.deletion) pageReactions.push("🗑"); //Add the wastebasket reaction if the user actually can delete
            for (let i = 0; i < pageReactions.length; i++) {
                await interactiveMessage.react(pageReactions[i]);
            }
            let page = 0; //Current page
            var timeout = setTimeout(async function() {
                collector.stop("timeout");
            }, limit);
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //reset the timeout
                if (r.emoji.name === pageReactions[0]) { //Move to first page
                    if (page !== 0) { //Dont edit for nothing
                        page = 0;
                        editMessage(page);
                    }
                } else if (r.emoji.name === pageReactions[1]) { //Move to previous page
                    if (page === 0) {
                        page = params.content.length - 1;
                    } else {
                        page--;
                    }
                    editMessage(page);
                } else if (r.emoji.name === pageReactions[2]) { //Move to next page
                    if (page === params.content.length - 1) {
                        page = 0;
                    } else {
                        page++;
                    }
                    editMessage(page);
                } else if (r.emoji.name === pageReactions[3]) { //Move to last page
                    if (!page !== params.content.length - 1) { //Dont edit if already at last page
                        page = params.content.length - 1;
                        editMessage(page);
                    }
                } else if (r.emoji.name === pageReactions[4]) { //Abort the command
                    clearTimeout(timeout); //Dont let the timeout continue any further, after all the command ended
                    collector.stop("aborted"); //End the collector
                } else if (params.deletion && pageReactions[5]) { //If deletion, delete
                    params.content.split(page, 1);
                    if (page !== 0) page--;
                    editMessage(page);
                }
                await r.remove(message.author.id); //Delete user reaction
                timeout = setTimeout(async function() {
                    collector.stop("timeout");
                }, limit); //Restart the timeout
            });
            collector.on('end', async(collected, reason) => { //On collector end
                await interactiveMessage.delete();
                return resolve({
                    endReason: reason,
                    collected: collected
                });
            });
        });
    }
    client.createInteractiveMessage = createInteractiveMessage; //Export it as a property of the client object so we can use it everywhere
}