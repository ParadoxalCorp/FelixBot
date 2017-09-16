exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const userEntry = client.userData.get(message.author.id);
            let marketItems = [
                [{
                    name: ':pencil2: Name',
                    value: ':gift_heart: Love point',
                    inline: true
                }, {
                    name: ':notepad_spiral: Description',
                    value: 'Gives you another love point that you can use every 12h',
                    inline: true
                }, {
                    name: ':ribbon: Price',
                    value: `${10000 * userEntry.generalSettings.perks.love.length} Points`,
                    inline: true
                }]
            ];
            const mainObject = function(page, embedFields) {
                return {
                    embed: {
                        title: ':shopping_cart: Market',
                        description: `Welcome to the market ! You can use the arrows to navigate through the items list and :shopping_cart: to buy an item`,
                        fields: embedFields[page],
                        footer: {
                            text: `Showing page ${page + 1}/${marketItems.length} | Time limit: 120 seconds`
                        }
                    }
                }
            }
            let page = 0; //current page
            let interactiveMessage = await message.channel.send(mainObject(page, marketItems));
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            let pageReactions = ["⏮", "◀", "▶", "⏭", "🛒", "❌"];
            for (let i = 0; i < pageReactions.length; i++) {
                await interactiveMessage.react(pageReactions[i]);
            }
            let timeout = setTimeout(async function() {
                collector.stop("timeout");
            }, 120000);
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //reset the timeout
                if (r.emoji.name === pageReactions[0]) { //Move to first page
                    if (page !== 0) { //Dont edit for nothing
                        page = 0;
                        await interactiveMessage.edit(mainObject(page, marketItems));
                    }
                } else if (r.emoji.name === pageReactions[1]) { //Move to previous page
                    if (page === 0) page = marketItems.length - 1;
                    else page--;
                    await interactiveMessage.edit(mainObject(page, marketItems));
                } else if (r.emoji.name === pageReactions[2]) { //Move to next page
                    if (page === marketItems.length - 1) page = 0;
                    else page++;
                    await interactiveMessage.edit(mainObject(page, marketItems));
                } else if (r.emoji.name === pageReactions[3]) { //Move to last page
                    if (!page !== marketItems.length - 1) { //Dont edit if already at last page
                        page = marketItems.length - 1;
                        await interactiveMessage.edit(mainObject(page, marketItems));
                    }
                } else if (r.emoji.name === pageReactions[4]) { //Buy an item
                    let splitPrice = marketItems[page][2].value.split(/\s+/);
                    if (splitPrice[0] > userEntry.generalSettings.points) {
                        let notEnoughPoints = await message.channel.send({
                            embed: {
                                description: `:x: You need ${splitPrice[0] - userEntry.generalSettings.points} more to buy this item`
                            }
                        });
                        notEnoughPoints.delete(5000);
                    } else {
                        if (marketItems[page][0].value === ':gift_heart: Love point') {
                            userEntry.generalSettings.perks.love.push({
                                type: 'Paid',
                                cooldown: 0
                            });
                            userEntry.generalSettings.points = userEntry.generalSettings.points - splitPrice[0];
                            marketItems[page][2].value = `${10000 * userEntry.generalSettings.perks.love.length} Points`;
                            let itemBought = await message.channel.send({
                                embed: {
                                    description: `:white_check_mark: You bought a love point for **${splitPrice[0]}** points, you have **${userEntry.generalSettings.points}** points remaining`
                                }
                            });
                            await interactiveMessage.edit(mainObject(page, marketItems));
                            itemBought.delete(10000);
                        }
                    }
                } else if (r.emoji.name === pageReactions[5]) { //Abort the command
                    collector.stop("aborted"); //End the collector
                }
                await r.remove(message.author.id); //Delete user reaction
                timeout = setTimeout(async function() {
                    collector.stop("timeout");
                }, 120000); //Restart the timeout
            });
            collector.on('end', async(collected, reason) => { //-------------------------------------------------------------On collector end-------------------------------------
                client.userData.set(message.author.id, userEntry);
                await interactiveMessage.delete();
            });
        } catch (err) {
            client.emit('commandFail', message, err);
        }
    })
}

exports.conf = {
    guildOnly: true,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'market',
    description: 'The market is where you can buy some perks with your points, stuff like more love points for example',
    usage: 'market',
    category: 'misc'
};