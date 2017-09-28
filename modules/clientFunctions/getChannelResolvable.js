const Discord = require('discord.js');
module.exports = async(client) => {
    /**
     * @param {message} message The message that triggered the command
     * @param {Object} options The options
     * @param {number} options.charLimit - Defines the length required for an argument to be included in the search, default is 3
     * @param {boolean} options.shift - Whether or not the first element should be removed, usually to dont include the prefix and make the search faster, default is false
     */
    function getChannelResolvable(message, options) {
        return new Promise(async(resolve, reject) => {
            let args = message.content.split(/\s+/);
            if (!options) options = Object.create(null); //Handle missing parameter
            if (options.shift) args.shift(); //Remove prefix + command
            const resolvedChannels = new Discord.Collection();
            var matchedByPartial = false;
            for (let i = 0; i < args.length; i++) {
                //------------------Resolve by ID--------------------
                if (args[i].toLowerCase().length >= (options.charLimit || 3)) { //(dont try to resolve too small stuff)
                    if (!isNaN(args[i])) {
                        if (message.guild.channels.get(args[i])) {
                            resolvedChannels.set(args[i], message.guild.channels.get(args[i]));
                        }
                    }
                    //------------------Resolve by whole name--------------
                    let filterByWholeName = message.guild.channels.filter(g => g.name === args[i].toLowerCase());
                    if (filterByWholeName.size > 0) resolvedChannels.set(filterByWholeName.first().id, filterByWholeName.first());
                    else {
                        //----------------Resolve by partial name-------------------------
                        let filterByPartial = message.guild.channels.filter(g => g.name.includes(args[i].toLowerCase()));
                        if (filterByPartial.size > 0) {
                            let channelObject = filterByPartial.first();
                            if (!matchedByPartial || !matchedByPartial.name.toLowerCase().includes(channelObject.name)) {
                                if (filterByPartial.size > 1) {
                                    let filteredArray = Array.from(filterByPartial.values());
                                    let c = 1;
                                    const selectedChannel = await client.awaitReply({
                                        message: message,
                                        limit: 30000,
                                        title: ":mag: Channels search",
                                        question: "Multiple Channels found, select one by typing a number ```\n" + filteredArray.map(r => `[${c++}] ${r.name}`).join("\n") + "```"
                                    });
                                    if (!selectedChannel.reply || isNaN(selectedChannel.reply.content) || selectedChannel.reply.content > filteredArray.length || selectedChannel.reply.content < 1) {
                                        await selectedChannel.question.delete();
                                        if (selectedChannel.reply && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                            await selectedChannel.reply.delete();
                                        }
                                    } else {
                                        channelObject = filteredArray[selectedChannel.reply.content - 1];
                                        await selectedChannel.question.delete();
                                        if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await selectedChannel.reply.delete();

                                    }
                                }
                            }
                            matchedByPartial = channelObject;
                            resolvedChannels.set(channelObject.id, channelObject);
                        }
                    }
                }
            }
            resolve(resolvedChannels);
        });
    }
    client.getChannelResolvable = getChannelResolvable;
}