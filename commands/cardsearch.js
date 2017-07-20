const unirest = require('unirest');

exports.run = async(client, message) => {
    try {
        var whitespace = message.content.indexOf(" ");
        if (whitespace === -1) {
            return message.channel.send(":x: The card name you entered is not valid");
        }
        var card = message.content.substr(client.prefix.length + whitespace - client.prefix.length + 1); //kek
        var trimCard = card.trim()
        var replaceWhitespace = trimCard.replace(/\s/gi, "%20");
        var search = message.content.indexOf("-");
        var atkSearch = message.content.indexOf("-a");
        var lifeSearch = message.content.indexOf("-h");
        var armorSearch = message.content.indexOf("-d");
        var costSearch = message.content.indexOf("-c");
        var raceSearch = message.content.indexOf("-r");
        var searchLink;
        if (search !== -1) {
            if (raceSearch !== -1) {
                var fromStart = message.content.substr(raceSearch + 3);
                var supposedRace;
                if (fromStart.indexOf("-") !== -1) {
                    supposedRace = fromStart.substr(0, fromStart.indexOf("-")); //In case there are other parameters
                } else {
                    supposedRace = fromStart;
                }
                if (supposedRace === "") {
                    return await message.channel.send(":x: You need to specify a race !");
                }
                var trimRace = supposedRace.trim();
                var race = trimRace.replace(/\s/gi, "%20");
                searchLink = `https://omgvamp-hearthstone-v1.p.mashape.com/cards/races/${race}`;
            } else {
                searchLink = `https://omgvamp-hearthstone-v1.p.mashape.com/cards`;
            }
            if (atkSearch !== -1) {
                var supposedAtk = message.content.substr(atkSearch + 3, 2);
                if (supposedAtk === "") {
                    return await message.channel.send(":x: You need to specify an attack number");
                }
                var atk = supposedAtk.trim();
                if (searchLink.substr(45) === "cards") { //Check if another parameters is already here
                    searchLink += `?attack=${atk}`;
                } else {
                    searchLink += `&attack=${atk}`; //This one will never be triggered, just in order to make a generic code
                }
            }
            if (armorSearch !== -1) {
                var supposedArmor = message.content.substr(armorSearch + 3, 2);
                if (supposedArmor === "") {
                    return await message.channel.send(":x: You need to specify a durability number");
                }
                var durability = supposedArmor.trim();
                if (searchLink.substr(45) === "cards") { //Check if another parameters is already here
                    searchLink += `?durability=${durability}`;
                } else {
                    searchLink += `&durability=${durability}`;
                }
            }
            if (lifeSearch !== -1) {
                var supposedHealth = message.content.substr(lifeSearch + 3, 2);
                if (supposedHealth === "") {
                    return await message.channel.send(":x: You need to specify a health number");
                }
                var health = supposedHealth.trim();
                if (searchLink.substr(45) === "cards") { //Check if another parameters is already here
                    searchLink += `?health=${health}`;
                } else {
                    searchLink += `&health=${health}`;
                }
            }
            if (costSearch !== -1) {
                var supposedCost = message.content.substr(costSearch + 3, 2);
                if (supposedCost === "") {
                    return await message.channel.send(":x: You need to specify a cost number");
                }
                var cost = supposedCost.trim();
                if (searchLink.substr(45) === "cards") { //Check if another parameters is already here
                    searchLink += `?cost=${cost}`;
                } else {
                    searchLink += `&cost=${cost}`;
                }
            }
            try {
                fetch: {
                    await unirest.get(`${searchLink}`)
                    .header(`X-Mashape-Key`, `${client.database.Data.global[0].mashapeKey}`)
                    .end(async function (result) {
                        var cardResult;
                        if (raceSearch !== -1) {
                            cardResult = result.body[0];
                            var fromRace = message.content.substr(raceSearch + 2);
                            if (fromRace.indexOf("-") !== -1) {
                                return await message.channel.send(":x: You cant combine the race parameter with any other search parameters");
                            }
                        } else {
                            cardResult = result.body.Basic;
                        }
                        if (cardResult.length != 0) {
                            if (raceSearch !== -1) {
                                cardResult = result.body;
                            }
                            var cardsList = `---Here's the cards corresponding to your search (10 first results):\n`;
                            var i;
                            for (i = 0; i < cardResult.length; i++) {
                                var attack = ":boom: **Attack:** None";
                                var health = ":heart: **Health:** None";
                                var cost = ":moneybag: **Cost:** None";
                                var type = ":earth_africa: **Type:** None";
                                if (cardResult[i].attack) {
                                    attack = " :boom: **Attack:** " + cardResult[i].attack;
                                }
                                if (cardResult[i].health) {
                                    health = " :heart: **Health:** " + cardResult[i].health;
                                }
                                if (cardResult[i].cost) {
                                    cost = " :moneybag: **Cost:** " + cardResult[i].cost;
                                }
                                if (cardResult[i].type) {
                                    type = " :earth_africa: **Type:** " + cardResult[i].type;
                                }
                                cardsList += "`" + cardResult[i].name + "`" + attack + health + cost + type + "\n------------------------------------------------------\n";
                                //cardsList += ""; //placeholder
                                if (i >= 10) {
                                    return message.channel.send(cardsList);
                                }
                            }
                            return await message.channel.send(cardsList);
                        } else {
                            return await message.channel.send(`:x: I could not find any cards corresponding to your search`);
                        }
                    });
                }
            }
            catch (e) {
                await message.channel.send(":x: I ran into a critical error, but dont worry, i sent the details to my developper. If you want to learn more about it, feel free to join the support server");
                return hearthStone.sendError(e);
            }
        } else if (raceSearch === -1) {
            try {
                fetch: {
                    await unirest.get(`https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/${replaceWhitespace}`)
                    .header(`X-Mashape-Key`, `${client.database.Data.global[0].mashapeKey}`)
                    .end(async function (result) {
                        if (result.body[0] != undefined) {
                            var cardResult = result.body[0];
                            var cardStats = `---**Card ${cardResult.name}**---\n`;
                            if (cardResult.attack) {
                                cardStats += ":boom: **Attack:** " + cardResult.attack + "\n";
                            }
                            if (cardResult.health) {
                                cardStats += ":heart: **Health:** " + cardResult.health + "\n";
                            }
                            if (cardResult.durability) {
                                cardStats += ":shield: **Durability:** " + cardResult.durability + "\n";
                            }
                            if (cardResult.cost) {
                                cardStats += ":moneybag: **Cost:** " + cardResult.cost + "\n";
                            }
                            if (cardResult.type) {
                                cardStats += ":earth_africa: **Type:** " + cardResult.type + "\n";
                            }
                            if (cardResult.rarity) {
                                cardStats += ":gem: **Rarity:** " + cardResult.rarity + "\n";
                            }
                            if (cardResult.race) {
                                cardStats += ":cat: **Race:** " + cardResult.race + "\n";
                            }
                            if (cardResult.text) {
                                cardStats += ":notepad_spiral: **Description:** " + cardResult.text + "\n";
                            }
                            if (cardResult.cardSet) {
                                cardStats += ":ticket: **Card Set:** " + cardResult.cardSet + "\n";
                            }
                            if (cardResult.flavor) {
                                cardStats += ":speech_balloon: **Comment:** " + cardResult.flavor + "\n";
                            }
                            if (cardResult.playerClass) {
                                cardStats += ":sparkles: **Player Class:** " + cardResult.playerClass + "\n";
                            }
                            if ((cardResult.img) && (!cardResult.imgGold)) {
                                cardStats += ":frame_photo: **Image:** " + cardResult.img + "\n";
                            }
                            if (cardResult.imgGold) {
                                cardStats += ":frame_photo: **Image:** " + cardResult.imgGold + "\n";
                            }
                            return await message.channel.send(cardStats);
                        } else {
                            return await message.channel.send(`:x: I could not find the card \`` + card + `\``);
                        }
                    });
                }
            }
            catch (e) {
                console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
                return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
            }
        }
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["card", "hearthstone"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'cardsearch',
    description: 'Search for hearthstone cards',
    parameters: '`-r`(race), `-a`(attack), `-h`(health), `-d`(durability), `-c`(cost)',
    usage: 'cardsearch -a 2 -h 2',
    category: 'utility'
};
