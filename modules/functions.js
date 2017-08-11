module.exports = (client) => {
    client.throwError = function (message, name) {
        this.message = message;
        this.name = name;
    }
    client.awaitReply = async(message, title, question, limit = 30000) => { //Default message collector function
        const filter = m => m.author.id === message.author.id;
        const clientMessage = await message.channel.send({
            embed: {
                title: title,
                description: question
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

    client.getAuthorTags = function (message) { //default function to get the provided user tags
        const tagList = Array.from(client.tagDatas.filter(t => JSON.parse(t).author === message.author.id).map(t => JSON.parse(t).name));
        return tagList;
    }
    client.pageResults = function (message, text = "", results, size = 10) { //Default pagination function
        var result = [];
        const page = message.content.indexOf("-page");
        var j = 0;
        for (var i = 0; i < Math.ceil(results.length / size); i++) {
            result[i] = results.slice(j, j + size).join("\n");
            j = j + size;
        }
        if (result.length < 1) {
            return ":x: There's nothing to show";
        }
        if (page !== -1) {
            var pageNumber = message.content.substr(page + 5).trim().substr(0, 2);
            if (pageNumber === "") {
                return ":x: You did not enter a page";
            }
            pageNumber = Number(pageNumber);
            if (pageNumber > result.length) {
                return text + "Showing page 1/" + result.length + ". Use `" + client.guildDatas.get(message.guild.id).prefix + "command -page page number` to navigate through pages```\n" + result[0] + "```";
            }
            return text + "Showing page " + pageNumber + "/" + result.length + ". Use `" + client.guildDatas.get(message.guild.id).prefix + "command -page page number` to navigate through pages```\n" + result[pageNumber - 1] + "```";
        }
        return text + "Showing page 1/" + result.length + ". Use `" + client.guildDatas.get(message.guild.id).prefix + "command -page page number` to navigate through pages```\n" + result[0] + "```";
    }
    client.searchForParameter = function (message, parameter = false, newParameters = false) {
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
};
