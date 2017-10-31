exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const userEntry = client.userData.get(message.author.id);
            let marketItems = [];
            client.coreData.marketItems.value.filter(item => (item.buyableOnce && !userEntry.generalSettings.perks[item.perk].find(object => object === item.object)) || !item.buyableOnce).forEach(item => {
                marketItems.push([{
                    name: `:pencil2: Item name`,
                    value: item.name,
                    inline: true
                }, {
                    name: `:notepad_spiral: Description`,
                    value: item.description,
                    inline: true
                }, {
                    name: ':ribbon: Price',
                    value: `${typeof item.price === "number" ? item.price : (item.price.base * userEntry.generalSettings.perks[item.perk].length * item.price.multiplier)} points`,
                    inline: true
                }, {
                    name: `:shopping_cart: Combinable ?`,
                    value: item.buyableOnce ? `:x:` : `:white_check_mark:`,
                    inline: true
                }])
            });
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
                    let splitPrice = Number(marketItems[page][2].value.split(/\s+/)[0]);
                    if (splitPrice > userEntry.generalSettings.points) {
                        message.channel.send({
                            embed: {
                                description: `:x: You need ${splitPrice - userEntry.generalSettings.points} more to buy this item`
                            }
                        }).then(m => m.delete(5000));
                    } else {
                        let marketItem = client.coreData.marketItems.value.find(item => item.name === marketItems[page][0].value);
                        userEntry.generalSettings.perks[marketItem.perk].push(marketItem.object);
                        userEntry.generalSettings.points = userEntry.generalSettings.points - splitPrice;
                        marketItems[page][2].value = `${typeof marketItem.price === "number" ? marketItem.price : (marketItem.price.base * userEntry.generalSettings.perks[marketItem.perk].length * marketItem.price.multiplier)} Points`;
                        message.channel.send({
                            embed: {
                                description: `:white_check_mark: You bought a ${marketItems[page][0].value} for **${splitPrice}** points, you have **${userEntry.generalSettings.points}** points remaining`
                            }
                        }).then(m => m.delete(5000));
                        if (marketItem.buyableOnce) marketItems.splice(page, 1);
                        page = page === 0 ? 0 : page - 1;
                        await interactiveMessage.edit(mainObject(page, marketItems));
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
    disabled: false
};

exports.help = {
    name: 'market',
    description: 'The market is where you can buy some perks with your points, stuff like more love points for example',
    usage: 'market',
    category: 'misc'
};