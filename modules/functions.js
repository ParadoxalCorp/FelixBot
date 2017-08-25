module.exports = (client) => {
    client.throwError = function (message, name) {
        this.message = message;
        this.name = name;
    }
    //------------------------------------------------------------------------Await reply--------------------------------------------------------------------------------------------------------    

    client.awaitReply = async(message, title, question, limit = 30000) => { //Default message collector function
        if (message.content) {
            console.warn("DeprecationWarning: Calling the awaitReply() function with multiple parameters is now deprecated, provide an object of parameters instead");
        } else {
            var parameters = {
                message: false,
                embedObject: false,
                title: false,
                question: false,
                limit: 30000,
            }
            if (!message.message || (!message.embedObject && !message.title && !message.question)) throw "FunctionCallError: The message, title and question parameters must be provided";
            parameters.message = message.message;
            if (message.embedObject) {
                parameters.embedObject = message.embedObject;
            }
            parameters.title = message.title;
            parameters.question = message.question;
            if (message.limit) {
                parameters.limit = message.limit;
            }
            const filter = m => m.author.id === parameters.message.author.id;
            if (parameters.embedObject) {
                const clientMessage = await parameters.message.channel.send(
                    parameters.embedObject
                ).catch(console.error);
                try {
                    const collected = await parameters.message.channel.awaitMessages(filter, {
                        max: 1,
                        time: parameters.limit,
                        errors: ["time"]
                    });
                    if (collected.first().content === "") {
                        const collected = await parameters.message.channel.awaitMessages(filter, {
                            max: 1,
                            time: parameters.limit,
                            errors: ["time"]
                        });
                        return {
                            reply: collected.first(),
                            question: clientMessage
                        };
                    }
                    return {
                        reply: collected.first(),
                        question: clientMessage
                    };
                } catch (e) {
                    return false;
                }
            }
            const clientMessage = await parameters.message.channel.send({
                embed: {
                    title: parameters.title,
                    description: parameters.question
                }
            }).catch(console.error);
            try {
                const collected = await parameters.message.channel.awaitMessages(filter, {
                    max: 1,
                    time: parameters.limit,
                    errors: ["time"]
                });
                if (collected.first().content === "") {
                    const collected = await parameters.message.channel.awaitMessages(filter, {
                        max: 1,
                        time: parameters.limit,
                        errors: ["time"]
                    });
                    return {
                        reply: collected.first(),
                        question: clientMessage
                    };
                }
                return {
                    reply: collected.first(),
                    question: clientMessage
                };
            } catch (e) {
                return false;
            }
        }
        const filter = m => m.author.id === message.author.id;
        const clientMessage = await message.channel.send({
            embed: {
                title: title,
                description: question.substr(0, 2048)
            }
        }).catch(console.error);
        try {
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: limit,
                errors: ["time"]
            });
            if (collected.first().content === "") {
                const collected = await message.channel.awaitMessages(filter, {
                    max: 1,
                    time: limit,
                    errors: ["time"]
                });
                return {
                    reply: collected.first(),
                    question: clientMessage
                };
            }
            return {
                reply: collected.first(),
                question: clientMessage
            };
        } catch (e) {
            return false;
        }
    };
    //------------------------------------------------------------------------Get tags of users--------------------------------------------------------------------------------------------------------    

    client.getAuthorTags = function (message) { //default function to get the author tags
        const tagList = Array.from(client.tagDatas.filter(t => JSON.parse(t).author === message.author.id).map(t => JSON.parse(t).name));
        return tagList;
    }
    client.getUserTags = function (users) {
        if (typeof users !== "string" && !Array.isArray(users)) throw "FunctionCallError: Users must either be a string of a single user id or an array of users id";
        if (typeof users === "string") {
            const tagList = Array.from(client.tagDatas.filter(t => JSON.parse(t).author === users).map(t => JSON.parse(t).name));
            return tagList;
        } else {
            var usersTags = [];
            users.forEach(function (id) {
                const tagList = Array.from(client.tagDatas.filter(t => JSON.parse(t).author === id).map(t => JSON.parse(t).name));
                if (tagList.length !== 0) {
                    usersTags.push({
                        user: id,
                        tags: tagList
                    });
                }
            });
            return usersTags;
        }
    }
    //------------------------------------------------------------------------Search for parameters--------------------------------------------------------------------------------------------------------    

    client.searchForParameter = function (message, parameter = false, newParameters = false) {
        if (message.content) {
            console.warn("DeprecationWarning: Calling the searchForParameter() function with multiple parameters is now deprecated, provide an object of parameters instead");
        } else {
            var providedParameters = {
                message: false,
                parameter: false,
                newParameters: false
            }
            if (!message.message) throw "FunctionCallError: The message parameter must be provided";
            providedParameters.message = message.message;
            if (message.message.content) {
                message.message.content = message.message.content.toLowerCase();
            } else {
                message.message = message.message.toLowerCase();
            }
            if (message.parameter) {
                providedParameters.parameter = message.parameter;
            }
            if (message.newParameters) {
                providedParameters.newParameters = message.newParameters;
            }
            var parameters = new Map();
            const addParameter = {
                    aliases: ["-add", "-a", "-set", "-s"],
                    name: "add"
                },
                removeParameter = {
                    aliases: ["-remove", "-rm", "-r", "-delete", "-d"],
                    name: "remove"
                },
                editParameter = {
                    aliases: ["-edit", "-e"],
                    name: "edit"
                },
                pageParameter = {
                    aliases: ["-page", "-p"],
                    name: "page"
                };
            parameters.set("add", addParameter),
                parameters.set("remove", removeParameter),
                parameters.set("edit", editParameter),
                parameters.set("page", pageParameter);
            if (providedParameters.newParameters) {
                if (Array.isArray(providedParameters.newParameters)) {
                    providedParameters.newParameters.forEach(function (newParameter) {
                        if (typeof newParameter !== "object") throw "FunctionCallError: The new parameter must be an Object";
                        if ((!newParameter.aliases) || (!newParameter.name)) throw "FunctionCallError: The new parameter object must contain a \"aliases\" Array property and a \"name\" String property";
                        if ((!Array.isArray(newParameter.aliases) || (newParameter.aliases.length < 1))) throw "FunctionCallError: The new parameter aliases property must be an array and must not be empty";
                        if (typeof newParameter.name !== "string") throw "FunctionCallError: The new parameter name property must be a string";
                        if (parameters.get(newParameter.name)) throw "FunctionCallError: The new parameter supplied is already defined";
                        parameters.set(newParameter.name, newParameter);
                    });
                } else {
                    if (typeof providedParameters.newParameters !== "object") throw "FunctionCallError: The new parameter must be an Object";
                    if ((!providedParameters.newParameters.aliases) || (!providedParameters.newParameters.name)) throw "FunctionCallError: The new parameter object must contain a \"aliases\" Array property and a \"name\" String property";
                    if ((!Array.isArray(providedParameters.newParameters.aliases) || (providedParameters.newParameters.aliases.length < 1))) throw "FunctionCallError: The new parameter aliases property must be an array and must not be empty";
                    if (typeof providedParameters.newParameters.name !== "string") throw "FunctionCallError: The new parameter name property must be a string";
                    if (parameters.get(providedParameters.newParameters.name)) throw "FunctionCallError: The new parameter supplied is already defined";
                    parameters.set(providedParameters.newParameters.name, providedParameters.newParameters);
                }
            }
            if (!providedParameters.parameter) { //Basically, if no parameters are supplied, return an array of objetcs of all matched parameters
                var matchedParameters = []
                parameters.forEach(function (param) {
                    parameters.get(param.name).aliases.forEach(function (alias) {
                        if (providedParameters.message.content.indexOf(alias) !== -1) {
                            if (matchedParameters.filter(m => m.name === param.name).length === 0) { //Dont push the same argument cause aliases ^
                                var substractArg = providedParameters.message.content.substr(providedParameters.message.content.indexOf(alias) + alias.length + 1).trim();
                                if (substractArg.indexOf("-") !== -1) {
                                    substractArg = substractArg.substr(0, substractArg.indexOf("-")).trim();
                                }
                                matchedParameters.push({
                                    position: providedParameters.message.content.indexOf(alias),
                                    length: alias.length,
                                    name: parameters.get(param.name).name,
                                    argument: substractArg
                                });
                            }
                        }
                    });
                });
                if (matchedParameters.length < 1) {
                    return false;
                } else {
                    return matchedParameters;
                }
            } else { //Else return an object of the matched parameter
                if (!parameters.get(providedParameters.parameter)) throw "FunctionCallError: The supplied parameter does not exist";
                const searchParam = parameters.get(providedParameters.parameter);
                var match = false;
                searchParam.aliases.forEach(function (alias) {
                    if (match) return match; //Return the first match to avoid conflict with aliases
                    var providedParameter = providedParameters.message;
                    if (providedParameters.message.content) { //In case the given message is not a message
                        providedParameter = providedParameters.message.content;
                    }
                    if (providedParameter.indexOf(alias) !== -1) {
                        return match = {
                            position: providedParameter.indexOf(alias),
                            length: alias.length,
                            name: parameter
                        }
                    }
                });
                return match;
            }
        }
        var parameters = new Map();
        const addParameter = {
                aliases: ["-add", "-a", "-set", "-s"],
                name: "add"
            },
            removeParameter = {
                aliases: ["-remove", "-rm", "-r", "-delete", "-d"],
                name: "remove"
            },
            editParameter = {
                aliases: ["-edit", "-e"],
                name: "edit"
            },
            pageParameter = {
                aliases: ["-page", "-p"],
                name: "page"
            };
        parameters.set("add", addParameter),
            parameters.set("remove", removeParameter),
            parameters.set("edit", editParameter),
            parameters.set("page", pageParameter);
        if (newParameters) {
            if (Array.isArray(newParameters)) {
                newParameters.forEach(function (newParameter) {
                    if (typeof newParameter !== "object") throw "FunctionCallError: The new parameter must be an Object";
                    if ((!newParameter.aliases) || (!newParameter.name)) throw "FunctionCallError: The new parameter object must contain a \"aliases\" Array property and a \"name\" String property";
                    if ((!Array.isArray(newParameter.aliases) || (newParameter.aliases.length < 1))) throw "FunctionCallError: The new parameter aliases property must be an array and must not be empty";
                    if (typeof newParameter.name !== "string") throw "FunctionCallError: The new parameter name property must be a string";
                    if (parameters.get(newParameter.name)) throw "FunctionCallError: The new parameter supplied is already defined";
                    parameters.set(newParameter.name, newParameter);
                });
            } else {
                if (typeof newParameters !== "object") throw "FunctionCallError: The new parameter must be an Object";
                if ((!newParameters.aliases) || (!newParameters.name)) throw "FunctionCallError: The new parameter object must contain a \"aliases\" Array property and a \"name\" String property";
                if ((!Array.isArray(newParameters.aliases) || (newParameters.aliases.length < 1))) throw "FunctionCallError: The new parameter aliases property must be an array and must not be empty";
                if (typeof newParameters.name !== "string") throw "FunctionCallError: The new parameter name property must be a string";
                if (parameters.get(newParameters.name)) throw "FunctionCallError: The new parameter supplied is already defined";
                parameters.set(newParameters.name, newParameters);
            }
        }
        if (!parameter) { //Basically, if no parameters are supplied, return an array of objetcs of all matched parameters
            var matchedParameters = []
            parameters.forEach(function (param) {
                parameters.get(param.name).aliases.forEach(function (alias) {
                    if (message.content.indexOf(alias) !== -1) {
                        if (matchedParameters.filter(m => m.name === param.name).length === 0) { //Dont push the same argument cause aliases ^
                            var substractArg = message.content.substr(message.content.indexOf(alias) + alias.length + 1).trim();
                            if (substractArg.indexOf("-") !== -1) {
                                substractArg = substractArg.substr(0, substractArg.indexOf("-")).trim();
                            }
                            matchedParameters.push({
                                position: message.content.indexOf(alias),
                                length: alias.length,
                                name: parameters.get(param.name).name,
                                argument: substractArg
                            });
                        }
                    }
                });
            });
            if (matchedParameters.length < 1) {
                return false;
            } else {
                return matchedParameters;
            }
        } else { //Else return an object of the matched parameter
            if (!parameters.get(parameter)) throw "FunctionCallError: The supplied parameter does not exist";
            const searchParam = parameters.get(parameter);
            var match = false;
            searchParam.aliases.forEach(function (alias) {
                if (match) return match; //Return the first match to avoid conflict with aliases
                if (message.content.indexOf(alias) !== -1) {
                    return match = {
                        position: message.content.indexOf(alias),
                        length: alias.length,
                        name: parameter
                    }
                }
            });
            return match;
        }
    }
    //------------------------------------------------------------------------Get level details--------------------------------------------------------------------------------------------------------    

    client.getLevelDetails = function (level, exp) { //fancy function if we need to get these infos in some commands
        const exponent = 2;
        const baseXP = 100;
        const requiredXp = Math.floor(baseXP * (level ** exponent));
        const thisRequiredXp = Math.floor(baseXP * ((level - 1) ** exponent));
        const thisLevelExp = requiredXp - thisRequiredXp;
        const thisLevelProgress = exp - thisRequiredXp;
        return {
            remainingExp: requiredXp - exp,
            requiredExp: requiredXp,
            levelProgress: `${Math.round(exp) - Math.round(thisRequiredXp)}/${requiredXp - thisRequiredXp}`,
            nextLevel: level + 1,
            percentage: (Math.round(thisLevelProgress) / Math.round(requiredXp)) * 100
        }
    }
    //------------------------------------------------------------------------Page results--------------------------------------------------------------------------------------------------------    

    client.pageResults = function (message, text = "", results, size = 10, raw = false) { //Default pagination function
        if (message.content) {
            console.warn("DeprecationWarning: Calling the pageResults() function with multiple parameters is now deprecated, provide an object of parameters instead");
        } else {
            var parameters = {
                message: false,
                results: false,
                text: "",
                size: 10,
                raw: true
            }
            if (!message.message || !message.results) throw "FunctionCallError: The message and results parameters must be provided";
            parameters.message = message.message,
                parameters.results = message.results;
            if (message.text) {
                parameters.text = message.text;
            }
            if (message.size) {
                parameters.size = message.size;
            }
            if (!parameters.raw) {
                throw "Only the raw output is available at this moment"
            } else {
                var result = [];
                const page = client.searchForParameter({
                    message: parameters.message,
                    parameter: "page"
                });
                var j = 0;
                for (var i = 0; i < Math.ceil(parameters.results.length / size); i++) {
                    var builtPage = [];
                    builtPage.push(parameters.results.slice(j, j + size));
                    result.push(builtPage);
                    j = j + size;
                }
                if (page) {
                    var pageNumber = message.content.substr(page.position + page.length + 1).trim().substr(0, 2);
                    if (pageNumber === "") {
                        return ":x: You did not enter a page number";
                    }
                    if (typeof result[0][pageNumber - 1] === "undefined") {
                        return ":x: You did not enter a valid number";
                    }
                    return {
                        results: result[0][pageNumber - 1],
                        page: pageNumber + "/" + result.length
                    };
                } else {
                    return {
                        results: result[0][0],
                        page: "1/" + result.length
                    };
                }
            }
        }
        if (raw) {
            var result = []
            const page = client.searchForParameter(message, "page");
            var j = 0;
            for (var i = 0; i < Math.ceil(results.length / size); i++) {
                var builtPage = [];
                builtPage.push(results.slice(j, j + size));
                result.push(builtPage);
                j = j + size;
            }
            if (page) {
                var pageNumber = message.content.substr(page.position + page.length + 1).trim().substr(0, 2);
                if (pageNumber === "") {
                    return ":x: You did not enter a page number";
                }
                if (typeof result[0][pageNumber - 1] === "undefined") {
                    return ":x: You did not enter a valid number";
                }
                return {
                    results: result[0][pageNumber - 1],
                    page: pageNumber + "/" + result.length
                };
            } else {
                return {
                    results: result[0][0],
                    page: "1/" + result.length
                };
            }
        } else {
            var result = [];
            const page = client.searchForParameter({
                message: message,
                parameter: "page"
            });
            var j = 0;
            for (var i = 0; i < Math.ceil(results.length / size); i++) {
                result[i] = results.slice(j, j + size).join("\n");
                j = j + size;
            }
            if (result.length < 1) {
                return ":x: There's nothing to show";
            }
            if (page) {
                var pageNumber = message.content.substr(page.position + page.length + 1).trim().substr(0, 2);
                if (pageNumber === "") {
                    return ":x: You did not enter a page";
                }
                if (typeof result[pageNumber] === "undefined") {
                    return ":x: You did not enter a valid number";
                }
                pageNumber = Number(pageNumber);
                if (pageNumber > result.length) {
                    return text + "Showing page 1/" + result.length + ". Use `" + client.guildDatas.get(message.guild.id).prefix + "command -page page number` to navigate through pages```\n" + result[0] + "```";
                }
                return text + "Showing page " + pageNumber + "/" + result.length + ". Use `" + client.guildDatas.get(message.guild.id).prefix + "command -page page number` to navigate through pages```\n" + result[pageNumber - 1] + "```";
            }
            return text + "Showing page 1/" + result.length + ". Use `" + client.guildDatas.get(message.guild.id).prefix + "command -page page number` to navigate through pages```\n" + result[0] + "```";
        }
    }
    //------------------------------------------------------------------------Reminders countdown launch--------------------------------------------------------------------------------------------------------
    client.findReminder = function (userId, reminderId) { //External functions to avoid the db caching
        const reminderPos = client.userDatas.get(userId).reminders.findIndex(function (element) {
            return element.id === reminderId; //In case the user deleted it
        });
        return reminderPos;
    }
    client.loadReminders = function () {
        setTimeout(async function () { //Wait for the database to load
            const existingReminders = client.userDatas.filter(u => JSON.parse(u).reminders).filter(u => JSON.parse(u).reminders.length !== 0);
            const expiredReminders = existingReminders.filter(u => JSON.parse(u).reminders.filter(r => r.timestamp < Date.now()).length !== 0);
            let deletedReminders = 0;
            let restartedReminders = 0;
            if (expiredReminders.size !== 0) {
                expiredReminders.forEach(function (user) {
                    let userEntry = client.userDatas.get(JSON.parse(user).id);
                    let userExpiredReminders = userEntry.reminders.filter(r => r.timestamp < Date.now());
                    userExpiredReminders.forEach(function (reminder) {
                        try {
                            client.users.get(JSON.parse(user).id).send("Hoi o/ seems like i was down at the moment so i might be a bit late but you asked me to remind you about ```\n" + reminder.cleanText + "```");
                            userEntry.reminders.splice(userEntry.reminders.findIndex(function (element) {
                                return element.id === reminder.id;
                            }), 1);
                            client.userDatas.set(JSON.parse(user).id, userEntry);
                            deletedReminders++;
                        } catch (err) {
                            console.error(err);
                        }
                    });
                });
                existingReminders = client.userDatas.filter(u => JSON.parse(u).reminders).filter(u => JSON.parse(u).reminders.length !== 0); //Update the collection since all the expired reminders got deleted
                console.log("Deleted " + deletedReminders + " expired reminders");
            }
            existingReminders.forEach(function (user) {
                let userEntry = client.userDatas.get(JSON.parse(user).id);
                userEntry.reminders.forEach(function (reminder) {
                    setTimeout(async function () {
                        if (client.findReminder(JSON.parse(user).id, reminder.id) === -1) {
                            return;
                        }
                        try {
                            client.users.get(JSON.parse(user).id).send("Hey, you wanted me to remind you about ```\n" + reminder.cleanText + "```");
                            userEntry.reminders.splice(client.findReminder(JSON.parse(user).id, reminder.id), 1); //Delete the expired reminder
                            client.userDatas.set(JSON.parse(user).id, userEntry);
                        } catch (err) {
                            console.error(err);
                        }
                    }, reminder.timestamp - Date.now());
                    restartedReminders++;
                });
            });
            console.log("Loaded and restarted " + restartedReminders + " reminders");
        }, 7500)
    }
};
