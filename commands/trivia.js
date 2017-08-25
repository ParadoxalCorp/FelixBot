const unirest = require("unirest");
exports.run = async(client, message) => {
    try {
        var args = message.content.split(/\s+/gim);
        args.shift();
        var triviaOptions = {
            link: `https://opentdb.com/api.php?`,
            amount: 1,
            difficulty: false,
            type: false,
            category: false,
            playerCount: 1,
            players: [{
                user: message.author.id,
                score: 0
            }]
        }
        if (args.length === 0) {
            triviaOptions.link += "amount=1";
        } else {
            args.forEach(function (arg) {
                const difficulty = client.searchForParameter({
                    message: message,
                    parameter: "difficulty",
                    newParameters: {
                        aliases: ['easy', 'medium', 'hard'],
                        name: "difficulty"
                    }
                });
                const type = client.searchForParameter({
                    message: message,
                    parameter: false,
                    newParameters: [{
                        aliases: ['true/false', 't/f'],
                        name: 'boolean'
                    }, {
                        aliases: ['multiple'],
                        name: 'multiple'
                    }]
                });
                if (!isNaN(arg)) {
                    if (arg > 50) {
                        triviaOptions.amount = 50;
                    }
                    if (arg < 0) {
                        triviaOptions.amount = 1
                    } else {
                        triviaOptions.amount = arg;
                    }
                    triviaOptions.link += `amount=${triviaOptions.amount}&`;
                }
                if (difficulty) {
                    triviaOptions.difficulty = message.content.substr(difficulty.position, difficulty.length);
                    triviaOptions.link += `difficulty=${triviaOptions.difficulty}&`;
                }
                if (type) {
                    const checkBoolean = type.findIndex(function (element) {
                        return element.name === "boolean";
                    });
                    const checkMultiple = type.findIndex(function (element) {
                        return element.name === "multiple";
                    });
                    if (checkBoolean !== -1) {
                        triviaOptions.type === "boolean";
                        triviaOptions.link += `type=boolean&`;
                    } else if (checkMultiple !== -1) {
                        triviaOptions.type === "multiple";
                        triviaOptions.link += `type=multiple&`;
                    }
                }
            });
        }
        if (triviaOptions.link === "https://opentdb.com/api.php?") {
            triviaOptions.link += "amount=1&";
        }
        try {
            fetch: {
                await unirest.get(`${triviaOptions.link}`)
                .end(async function (firstCall) {
                    var result = firstCall;
                    if (!result.body) {
                        return await message.channel.send(":x: An error occured with the trivia API :v");
                    }
                    if (result.body.response_code === 1) {
                        return await message.channel.send(":x: No results found :v");
                    } else if (result.body.response_code === 2) {
                        return await message.channel.send(":x: The parameters you specified are invalid");
                    }

                    const awaitPlayers = async function () { //Waiting room
                        return new Promise(async(resolve, reject) => {
                            const players = await client.awaitReply({
                                message: message,
                                title: ":gear: Trivia options",
                                question: "Mention the users you want to play with or answer with `none` to play alone",
                                limit: 60000
                            });
                            if (!players) {
                                return await message.channel.send(":x: Timeout: Command aborted");
                            }
                            if (players.reply.content.toLowerCase() === "none") {
                                await players.question.delete();
                                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                    await players.reply.delete();
                                }
                                resolve();
                            } else {
                                var waitingConfirmation = players.reply.mentions.users;
                                waitingConfirmation.delete(message.author.id);
                                const waitingRoom = await message.channel.send({
                                    embed: {
                                        title: ':gear: Trivia waiting room',
                                        description: 'The mentionned users have 60 seconds to accept, react with :white_check_mark: to accept or :x: to decline```\nPlayers: \n' + triviaOptions.players.map(m => `${message.guild.members.get(m.user).user.username}#${message.guild.members.get(m.user).user.discriminator}`).join("\n") + '\n\nWaiting confirmation: \n' + waitingConfirmation.map(m => `${m.username}#${m.discriminator}`).join("\n") + "```"
                                    }
                                });
                                await waitingRoom.react("✅");
                                await waitingRoom.react("❌");
                                const collector = waitingRoom.createReactionCollector((reaction, user) => players.reply.mentions.users.get(user.id)); //Mentionned users only
                                const roomTimeout = setTimeout(async function () {
                                    if (triviaOptions.players.length > result.body.results.length) { //Regenerate a new link if invalid
                                        triviaOptions.link = `https://opentdb.com/api.php?amount=${triviaOptions.players.length}&`;
                                        args.forEach(function (arg) {
                                            const difficulty = client.searchForParameter({
                                                message: message,
                                                parameter: "difficulty",
                                                newParameters: {
                                                    aliases: ['easy', 'medium', 'hard'],
                                                    name: "difficulty"
                                                }
                                            });
                                            const type = client.searchForParameter({
                                                message: message,
                                                parameter: false,
                                                newParameters: [{
                                                    aliases: ['true/false', 't/f'],
                                                    name: 'boolean'
                    }, {
                                                    aliases: ['multiple'],
                                                    name: 'multiple'
                    }]
                                            });
                                            if (difficulty) {
                                                triviaOptions.difficulty = message.content.substr(difficulty.position, difficulty.length);
                                                triviaOptions.link += `difficulty=${triviaOptions.difficulty}&`;
                                            }
                                            if (type) {
                                                const checkBoolean = type.findIndex(function (element) {
                                                    return element.name === "boolean";
                                                });
                                                const checkMultiple = type.findIndex(function (element) {
                                                    return element.name === "multiple";
                                                });
                                                if (checkBoolean !== -1) {
                                                    triviaOptions.type === "boolean";
                                                    triviaOptions.link += `type=boolean&`;
                                                } else if (checkMultiple !== -1) {
                                                    triviaOptions.type === "multiple";
                                                    triviaOptions.link += `type=multiple&`;
                                                }
                                            }
                                        });
                                        const regenerating = await message.channel.send("Questions lack detected, generating more questions...");
                                        await unirest.get(`${triviaOptions.link}`)
                                            .end(async function (secondCall) {
                                                result = secondCall;
                                            });
                                        await regenerating.delete();
                                    }
                                    resolve(waitingRoom.delete());
                                }, 60000);
                                collector.on('collect', async(r) => {
                                    if (r.emoji.name === "✅") {
                                        waitingRoom.reactions.get("%E2%9C%85").users.filter(u => !u.bot && u.id !== message.author.id).forEach(function (user) {
                                            if (triviaOptions.players.findIndex(function (element) {
                                                    return element.user === user.id;
                                                }) === -1) {
                                                triviaOptions.players.push({
                                                    user: user.id,
                                                    score: 0
                                                });
                                            }
                                            waitingConfirmation.delete(user.id);
                                        });
                                        await waitingRoom.edit({
                                            embed: {
                                                title: ':gear: Trivia waiting room',
                                                description: 'The mentionned users have 60 seconds to accept, react with :white_check_mark: to accept or :x: to decline```\nPlayers: \n' + triviaOptions.players.map(m => `${message.guild.members.get(m.user).user.username}#${message.guild.members.get(m.user).user.discriminator}`).join("\n") + '\n\nWaiting confirmation: \n' + waitingConfirmation.map(m => `${m.username}#${m.discriminator}`).join("\n") + "```"
                                            }
                                        })
                                    } else if (r.emoji.name === "❌") {
                                        waitingRoom.reactions.get("%E2%9D%8C").users.filter(u => !u.bot && u.id !== message.author.id).forEach(function (user) {
                                            var userPos = triviaOptions.players.findIndex(function (element) {
                                                return element.user === user.id;
                                            });
                                            if (userPos !== -1) {
                                                triviaOptions.players.splice(userPos, 1);
                                            }
                                            waitingConfirmation.delete(user.id);
                                        });
                                        await waitingRoom.edit({
                                            embed: {
                                                title: ':gear: Trivia waiting room',
                                                description: 'The mentionned users have 60 seconds to accept, react with :white_check_mark: to accept or :x: to decline```\nPlayers: \n' + triviaOptions.players.map(m => `${message.guild.members.get(m.user).user.username}#${message.guild.members.get(m.user).user.discriminator}`).join("\n") + '\n\nWaiting confirmation: \n' + waitingConfirmation.map(m => `${m.username}#${m.discriminator}`).join("\n") + "```"
                                            }
                                        })
                                    }
                                    //-----------------------------End of collector--------------------------------------------------                                    
                                    if (waitingConfirmation.size === 0) { //End waiting room if there is no more players in
                                        if (triviaOptions.players.length > result.body.results.length) { //Regenerate a new link if invalid
                                            triviaOptions.link = `https://opentdb.com/api.php?amount=${triviaOptions.players.length}&`;
                                            args.forEach(function (arg) {
                                                const difficulty = client.searchForParameter({
                                                    message: message,
                                                    parameter: "difficulty",
                                                    newParameters: {
                                                        aliases: ['easy', 'medium', 'hard'],
                                                        name: "difficulty"
                                                    }
                                                });
                                                const type = client.searchForParameter({
                                                    message: message,
                                                    parameter: false,
                                                    newParameters: [{
                                                        aliases: ['true/false', 't/f'],
                                                        name: 'boolean'
                    }, {
                                                        aliases: ['multiple'],
                                                        name: 'multiple'
                    }]
                                                });
                                                if (difficulty) {
                                                    triviaOptions.difficulty = message.content.substr(difficulty.position, difficulty.length);
                                                    triviaOptions.link += `difficulty=${triviaOptions.difficulty}&`;
                                                }
                                                if (type) {
                                                    const checkBoolean = type.findIndex(function (element) {
                                                        return element.name === "boolean";
                                                    });
                                                    const checkMultiple = type.findIndex(function (element) {
                                                        return element.name === "multiple";
                                                    });
                                                    if (checkBoolean !== -1) {
                                                        triviaOptions.type === "boolean";
                                                        triviaOptions.link += `type=boolean&`;
                                                    } else if (checkMultiple !== -1) {
                                                        triviaOptions.type === "multiple";
                                                        triviaOptions.link += `type=multiple&`;
                                                    }
                                                }
                                            });
                                            const regenerating = await message.channel.send("Questions lack detected, generating more questions...");
                                            await unirest.get(`${triviaOptions.link}`)
                                                .end(async function (secondCall) {
                                                    result = secondCall;
                                                });
                                            await regenerating.delete();
                                        }
                                        //Clean the waiting room stuff
                                        clearTimeout(roomTimeout);
                                        await waitingRoom.delete();
                                        collector.stop("No more players in the waiting room");
                                        resolve();
                                    }
                                })
                            }
                        });
                    }

                    await awaitPlayers();
                    //-----------------------------------Trivia session-------------------------------------------------------------
                    let currentPlayer = 0;
                    for (let pos = 0; pos < result.body.results.length; pos++) {
                        var question = result.body.results[pos];
                        var cleanQuestion = question.question;
                        const reactions = [{
                            unicode: "1⃣",
                            number: 1
                        }, {
                            unicode: "2⃣",
                            number: 2
                        }, {
                            unicode: "3⃣",
                            number: 3
                        }, {
                            unicode: "4⃣",
                            number: 4
                        }, {
                            unicode: "5⃣",
                            number: 5
                        }, {
                            unicode: "6⃣",
                            number: 6
                        }, {
                            unicode: "7⃣",
                            number: 7
                        }, {
                            unicode: "8⃣",
                            number: 8
                        }, {
                            unicode: "9⃣",
                            number: 9
                        }, {
                            unicode: "0⃣",
                            number: 0
                        }]
                        cleanQuestion = cleanQuestion.replace(/\&quot;/gim, "**");
                        cleanQuestion = cleanQuestion.replace(/\&#039;/gim, "");
                        cleanQuestion = cleanQuestion.replace(/\&deg/gim, "°");
                        cleanQuestion = cleanQuestion.replace(/\&eacute;/gim, "é");
                        cleanQuestion = cleanQuestion.replace(/\&rsquo;/gim, "'");
                        const incorrectAnswers = question.incorrect_answers,
                            correctAnswer = [question.correct_answer],
                            allAnswers = incorrectAnswers.concat(correctAnswer);
                        var embedFields = [];
                        let i = 1;
                        allAnswers.forEach(function (answer) {
                            var cleanAnswer = answer;
                            cleanAnswer = cleanAnswer.replace(/\&quot;/gim, "**");
                            cleanAnswer = cleanAnswer.replace(/\&#039;/gim, "");
                            cleanAnswer = cleanAnswer.replace(/\&deg/gim, "°");
                            cleanAnswer = cleanAnswer.replace(/\&eacute;/gim, "é");
                            cleanAnswer = cleanAnswer.replace(/\&rsquo;/gim, "'");
                            embedFields.push({
                                name: ':pencil: Possible answer',
                                value: `[${i}] ${answer}`,
                                inline: true
                            });
                            i++;
                        });
                        const reply = await message.channel.send({
                            embed: {
                                title: `:gear: Trivia`,
                                description: ":notepad_spiral: Its **" + client.users.get(triviaOptions.players[currentPlayer].user).username + "**'s turn !\n" + cleanQuestion + " (Time limit: 30 seconds)",
                                color: 0xf4b642,
                                fields: embedFields,
                                footer: {
                                    text: `Powered by OpenTriviaDatabase | Type: ${question.type} | Difficulty: ${question.difficulty} | Category: ${question.category}`
                                }
                            }
                        }).catch(console.error);
                        for (i = 0; i < allAnswers.length; i++) {
                            await reply.react(reactions[i].unicode);
                        }
                        const collector = reply.createReactionCollector((reaction, user) => triviaOptions.players[currentPlayer].user === user.id);
                        const awaitAnswer = async function () {
                            return new Promise(async(resolve, reject) => {
                                const timeout = setTimeout(async function () {
                                    collector.stop("Timeout");
                                    resolve(await message.channel.send(":x: Timeout: The correct answer was **" + question.correct_answer + "**"));
                                }, 35000);
                                collector.on('collect', async(r) => {
                                    const reactionPos = reactions.findIndex(function (element) {
                                        return element.unicode === r.emoji.name;
                                    });
                                    collector.stop("Answered");
                                    clearTimeout(timeout);
                                    if (allAnswers[reactionPos] === correctAnswer[0]) {
                                        triviaOptions.players[currentPlayer].score++;
                                        resolve(await message.channel.send(":white_check_mark: Well played ! The correct answer is **" + question.correct_answer + "** <:awoo_rainbow:345171973724176385>"));
                                    } else {
                                        resolve(await message.channel.send(":x: Wrong, the correct answer was **" + question.correct_answer + "**"));
                                    }
                                });
                            });
                        }
                        await awaitAnswer();
                        if (currentPlayer + 1 === triviaOptions.players.length) { //Change turn
                            currentPlayer = 0;
                        } else {
                            currentPlayer++;
                        }
                    }
                    if (triviaOptions.players.length > 1) {
                        const sortBestScore = triviaOptions.players.sort(function (a, b) {
                            return a.score - b.score;
                        });
                        sortBestScore.reverse();
                        const isDraw = sortBestScore.filter(p => p.score === sortBestScore[0].score);
                        if (isDraw.length > 1) {
                            return await message.channel.send("Its a draw between the players " + sortBestScore.map(p => `**${client.users.get(p.user).username}**`).join(", ") + ` with a score of **${sortBestScore[0].score}**!`);
                        } else {
                            return await message.channel.send("The winner is **" + client.users.get(sortBestScore[0].user).username + "** with a score of **" + sortBestScore[0].score + "**!")
                        }
                    } else {
                        return await message.channel.send("No more questions found, your score is " + triviaOptions.players[0].score);
                    }
                });
            }
        }
        catch (err) {
            console.error(err);
            return await message.channel.send(":x: An error occured");
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
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'trivia',
    description: 'Starts a trivia game',
    usage: 'trivia',
    category: 'fun',
    detailledUsage: 'Multiplayer and solo game, you can add some filters to the questions: \n`{prefix}trivia 5` Start a trivia session of 5 questions, 1 by default\n`{prefix}trivia t/f` Start of trivia session of true/false, replace `t/f` with `multiple` to get only multiple choice questions\n`{prefix}trivia hard` Start a trivia session of hard questions, can be `easy`,`medium` or `hard`\n`{prefix}trivia 5 t/f hard` You can combine parameters as well'
};
