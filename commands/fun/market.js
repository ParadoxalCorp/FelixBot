class Market {
    constructor() {
        this.help = {
            name: 'market',
            description: 'The market is where you can buy some perks with your points, stuff like more love points for example',
            usage: 'market'
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const userEntry = client.userData.get(message.author.id);
                let marketItems = [];
                client.coreData.marketItems.filter(item => (item.buyableOnce && !userEntry.generalSettings.perks[item.perk].find(object => object === item.object)) || !item.buyableOnce).forEach(item => {
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
                const collector = interactiveMessage.createReactionCollector((reaction) => reaction.user.id === message.author.id);
                let pageReactions = ["◀", "▶", "🛒", "❌"];
                for (let i = 0; i < pageReactions.length; i++) {
                    await interactiveMessage.addReaction(pageReactions[i]);
                }
                let timeout = setTimeout(async function() {
                    collector.stop("timeout");
                }, 120000);
                collector.on('collect', async(r) => {
                    clearTimeout(timeout); //reset the timeout
                    interactiveMessage.removeReaction(r.emoji.name, r.user.id);
                    if (r.emoji.name === "◀") { //Move to previous page
                        page = page === 0 ? marketItems.length - 1 : page - 1;
                        await interactiveMessage.edit(mainObject(page, marketItems));
                    } else if (r.emoji.name === "▶") { //Move to next page
                        page = page === marketItems.length - 1 ? 0 : page + 1;
                        await interactiveMessage.edit(mainObject(page, marketItems));
                    } else if (r.emoji.name === "🛒") { //Buy an item
                        let splitPrice = parseInt(marketItems[page][2].value.split(/\s+/)[0]);
                        if (splitPrice > userEntry.generalSettings.points) {
                            message.channel.send({
                                embed: {
                                    description: `:x: You need ${splitPrice - userEntry.generalSettings.points} more to buy this item`
                                }
                            }).then(m => m.delete(5000));
                        } else {
                            let marketItem = client.coreData.marketItems.find(item => item.name === marketItems[page][0].value);
                            userEntry.generalSettings.perks[marketItem.perk].push(marketItem.object);
                            userEntry.generalSettings.points = userEntry.generalSettings.points - splitPrice;
                            marketItems[page][2] = `${typeof marketItem.price === "number" ? marketItem.price : (marketItem.price.base * userEntry.generalSettings.perks[marketItem.perk].length * marketItem.price.multiplier)} Points`;
                            message.channel.createMessage({
                                embed: {
                                    description: `:white_check_mark: You bought a ${marketItems[page][0].value} for **${splitPrice}** points, you have **${userEntry.generalSettings.points}** points remaining`
                                }
                            }).then(m => m.delete(5000));
                            if (marketItem.buyableOnce) marketItems.splice(page, 1);
                            page = page === 0 ? 0 : page - 1;
                            await interactiveMessage.edit(mainObject(page, marketItems));
                        }
                    } else if (r.emoji.name === "❌") { //Abort the command
                        collector.stop("aborted"); //End the collector
                    }
                    timeout = setTimeout(async function() {
                        collector.stop("timeout");
                    }, 120000); //Restart the timeout
                });
                collector.on('end', async(collected, reason) => { //-------------------------------------------------------------On collector end-------------------------------------
                    client.userData.set(message.author.id, userEntry);
                    interactiveMessage.delete();
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Market();