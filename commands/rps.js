exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const userEntry = client.userData.get(message.author.id);
            //Get the arg
            let args = message.content.split(/\s+/);
            args.shift();
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
                let choice = await client.awaitReply({
                    message: message,
                    title: ':gear: Rock-Paper-Scissors parameter',
                    question: `Eh? You forgot to say what you wanted to play? Don't worry since i am kind i give you 60 seconds more :^). Answer with \`rock\`, \`paper\` or \`scissors\``
                });
                choice.question.delete();
                if (!choice.reply || !rps.find(c => c.name === choice.reply.content.trim().toLowerCase())) return resolve(await message.channel.send(':x: Command aborted'));
                userChoice = rps.find(c => c.name === choice.reply.content.trim().toLowerCase());
                if (choice.reply.deletable) choice.reply.delete();
            }
            let felixChoice = rps[Math.floor(Math.random() * ((rps.length - 1) - 0 + 1)) + 0];
            let results = 'I win !';
            if (userChoice.winAgainst === felixChoice.name) results = 'Oh... You win...';
            else if (felixChoice.winAgainst !== userChoice.name) results = 'Ehhh, its a draw !';
            //If no points were gambled
            if (!pointsGambled) {
                return resolve(await message.channel.send({
                    embed: {
                        title: ':scissors: Rock-Paper-Scissors',
                        description: `You choose **${userChoice.name}**, i choose **${felixChoice.name}** and... ${results}`
                    }
                }));
            }
            if (pointsGambled < 0) return resolve(await message.channel.send(':x: Ehhhh, what do you want me to do with that'));
            //Else determine how much was gambled and how much was won/lost
            if (Math.round(Number(pointsGambled)) > userEntry.generalSettings.points) pointsGambled = userEntry.generalSettings.points;
            else pointsGambled = Math.round(Number(pointsGambled));
            let pointsResults = `You keep your **${pointsGambled}** points`;
            if (results === "I win !") {
                userEntry.generalSettings.points = userEntry.generalSettings.points - pointsGambled;
                pointsResults = `You lose **${pointsGambled}** points, you now have **${userEntry.generalSettings.points}** points`;
            } else if (results === 'Oh... You win...') {
                userEntry.generalSettings.points = userEntry.generalSettings.points + (pointsGambled * 2);
                pointsResults = `You win **${pointsGambled * 2}** points, you now have **${userEntry.generalSettings.points}** points`;
            }
            //Save the changes
            client.userData.set(message.author.id, userEntry);
            //Output the results
            resolve(await message.channel.send({
                embed: {
                    title: ':scissors: Rock-Paper-Scissors',
                    description: `You choose **${userChoice.name}**, i choose **${felixChoice.name}** and... ${results}\n${pointsResults}`
                }
            }));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    })
}

exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'rps',
    description: 'Play a game of rock-paper-scissors against Felix, you can also gamble and try to win some points !',
    usage: 'rps rock',
    category: 'fun',
    detailedUsage: '`{prefix}rps rock` Will casually play rock against Felix\n`{prefix}rps paper 500` Will play paper against Felix and gamble 500 of your points'
};