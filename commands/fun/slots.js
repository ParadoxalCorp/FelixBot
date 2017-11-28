class Slots {
    constructor() {
        this.help = {
            name: 'slots',
            description: 'Gamble your points on your luck, and if you dont have any luck, well, good luck',
            usage: 'slots',
            category: 'fun',
            detailedUsage: 'Use `{prefix}slots [points]` to gamble your points, so for example `{prefix}slots 5` will gamble 5 of your points'
        }
        this.conf = {
            cooldownWeight: 3
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const userEntry = client.userData.get(message.author.id);
                var args = message.content.split(/\s+/);
                args.shift();
                if (args.length === 0) { //--------------------------------------Current balance--------------------------------------------------
                    return resolve(await message.channel.createMessage("You currently have **" + userEntry.generalSettings.points + "** points"));
                } else { //----------------------------------------------------Slots stuff-------------------------------------------------
                    const getRandomNumber = function(max, min) {
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                    var gambledPoints = args[0];
                    //If invalid number set to 1
                    if (isNaN(gambledPoints)) gambledPoints = 1;
                    //Handle invalid arguments
                    if (gambledPoints > userEntry.generalSettings.points) return resolve(await message.channel.createMessage(":x: You do not have enough points ! You currently have **" + userEntry.generalSettings.points + "** points"));
                    if (gambledPoints < 0) return resolve(await message.channel.createMessage(':x: Ehhhh, what do you want me to do with that'));
                    var slotsOutputs = [{ //Possible outputs and multipliers array
                        multiplier: 2,
                        name: ":cherries:"
                    }, {
                        multiplier: 2,
                        name: ":french_bread:"
                    }, {
                        multiplier: 2,
                        name: ":beer:"
                    }, {
                        multiplier: 2,
                        name: ":coffee:"
                    }, {
                        multiplier: 3,
                        name: ":gem:"
                    }, {
                        multiplier: -2,
                        name: ":money_with_wings:"
                    }, {
                        multiplier: -2,
                        name: ":bomb:"
                    }, {
                        multiplier: -2,
                        name: ":space_invader:"
                    }, {
                        multiplier: -2,
                        name: ":gun:"
                    }, {
                        multiplier: -3,
                        name: ":coffin:"
                    }];
                    var firstResult = slotsOutputs[getRandomNumber(0, slotsOutputs.length - 1)],
                        secondResult = slotsOutputs[getRandomNumber(0, slotsOutputs.length - 1)],
                        thirdResult = slotsOutputs[getRandomNumber(0, slotsOutputs.length - 1)];
                    let results = [firstResult, secondResult, thirdResult];
                    let match;
                    results.forEach(function(result) {
                        if (results.filter(r => r.name === result.name).length >= 2) match = results.filter(r => r.name === result.name);
                    });
                    async function sendResults(resultText) {
                        return await message.channel.createMessage({
                            embed: {
                                title: ":slot_machine: Slots",
                                description: `You run the slots, and...\n\n---------------------\n | ${slotsOutputs[getRandomNumber(0, slotsOutputs.length)].name} | ${slotsOutputs[getRandomNumber(0, slotsOutputs.length)].name} |  ${slotsOutputs[getRandomNumber(0, slotsOutputs.length)].name} | \n> | ${firstResult.name}|${secondResult.name}|${thirdResult.name}|<\n | ${slotsOutputs[getRandomNumber(0, slotsOutputs.length)].name} | ${slotsOutputs[getRandomNumber(0, slotsOutputs.length)].name} | ${slotsOutputs[getRandomNumber(0, slotsOutputs.length)].name} | \n----------------------\n${resultText}`,
                                color: 0xF2A90C
                            }
                        });
                    }
                    if (!match) {
                        return resolve(sendResults("**Nothing**, you dont lose nor win any points, everyone's happy right?"));
                    }
                    var multiplier = match[0].multiplier * (match.length - 1);
                    if (gambledPoints * multiplier < 0) {
                        userEntry.generalSettings.points = userEntry.generalSettings.points + gambledPoints * multiplier;
                        client.userData.set(message.author.id, userEntry);
                        return resolve(sendResults(`You **lose**, **${Math.abs(gambledPoints * multiplier)}** points has been debited from your account. You now have **${userEntry.generalSettings.points}**`));
                    } else {
                        userEntry.generalSettings.points = userEntry.generalSettings.points + gambledPoints * multiplier;
                        client.userData.set(message.author.id, userEntry);
                        return resolve(sendResults(`You **win**, **${gambledPoints * multiplier}** points has been credited to your account. You now have **${userEntry.generalSettings.points}** points`));
                    }
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Slots();