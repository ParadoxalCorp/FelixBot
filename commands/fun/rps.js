class RPS {
    constructor() {
        this.help = {
            name: 'rps',
            description: 'Play a game of rock-paper-scissors against Felix, you can also gamble and try to win some points !',
            usage: 'rps rock',
            detailedUsage: '`{prefix}rps rock` Will casually play rock against Felix\n`{prefix}rps paper 500` Will play paper against Felix and gamble 500 of your points'
        }
        this.conf = {
            cooldownWeight: 3
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const userEntry = client.userData.get(message.author.id);
                let rps = [{
                    name: 'rock',
                    winAgainst: 'scissors'
                }, {
                    name: 'paper',
                    winAgainst: 'rock'
                }, {
                    name: 'scissors',
                    winAgainst: 'paper'
                }];
                let userChoice = rps.find(c => c.name === args.filter(a => isNaN(a))[0]);
                let pointsGambled = args.filter(a => !isNaN(a))[0];
                //If no args provided ask for user input
                if (!userChoice) {
                    let choice = await message.awaitReply({
                        message: {
                            embed: {
                                title: ':gear: Rock-Paper-Scissors parameter',
                                description: `Eh? You forgot to say what you wanted to play? Don't worry since i am kind i give you 60 seconds more :^). Answer with \`rock\`, \`paper\` or \`scissors\``
                            }
                        }
                    });
                    choice.query.delete();
                    if (!choice.reply || !rps.find(c => c.name === choice.reply.content.trim().toLowerCase())) return resolve(await message.channel.createMessage(':x: Command aborted'));
                    userChoice = rps.find(c => c.name === choice.reply.content.trim().toLowerCase());
                    if (choice.reply.deletable) choice.reply.delete();
                }
                let felixChoice = rps[Math.floor(Math.random() * ((rps.length - 1) - 0 + 1)) + 0];
                let results = userChoice.winAgainst === felixChoice.name ? "Oh... You win..." : (felixChoice.winAgainst !== userChoice.name ? "Ehhh, its a draw !" : "I win !");
                //If no points were gambled
                if (!pointsGambled) {
                    return resolve(await message.channel.createMessage({
                        embed: {
                            title: ':scissors: Rock-Paper-Scissors',
                            description: `You choose **${userChoice.name}**, i choose **${felixChoice.name}** and... ${results}`
                        }
                    }));
                }
                if (pointsGambled <= 0) return resolve(await message.channel.createMessage(':x: Ehhhh, what do you want me to do with that'));
                //Else determine how much was gambled and how much was won/lost
                if (Math.round(Number(pointsGambled)) > userEntry.generalSettings.points) pointsGambled = userEntry.generalSettings.points;
                else pointsGambled = Math.round(Number(pointsGambled));
                let pointsResults = `You keep your **${pointsGambled}** points`;
                if (results === "I win !") {
                    userEntry.generalSettings.points = userEntry.generalSettings.points - pointsGambled;
                    pointsResults = `You lose **${pointsGambled}** points, you now have **${Math.round(userEntry.generalSettings.points)}** points`;
                } else if (results === 'Oh... You win...') {
                    let wonPoints = pointsGambled * 2;
                    if (userEntry.generalSettings.perks.boosters.find(p => p.boost === "points")) wonPoints = new String(wonPoints + ((userEntry.generalSettings.perks.boosters.find(p => p.boost === "points").percentageBoost / wonPoints) * 100));
                    userEntry.generalSettings.points = userEntry.generalSettings.points === client.config.options.pointsLimit ? client.config.options.pointsLimit : Number(userEntry.generalSettings.points) + Number(Number(wonPoints).toFixed(wonPoints.length + 1));
                    pointsResults = `You win **${Math.round(Number(Number(wonPoints).toFixed(wonPoints.length + 1)))}** points, you now have **${Math.round(userEntry.generalSettings.points)}** points`;
                }
                //Save the changes
                client.userData.set(message.author.id, userEntry);
                //Output the results
                resolve(await message.channel.createMessage({
                    embed: {
                        title: ':scissors: Rock-Paper-Scissors',
                        description: `You choose **${userChoice.name}**, i choose **${felixChoice.name}** and... ${results}\n${pointsResults}`
                    }
                }));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new RPS();