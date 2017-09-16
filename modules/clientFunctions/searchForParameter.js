module.exports = async(client) => {
    client.searchForParameter = async function(params) {
        return new Promise(async(resolve, reject) => {
            var providedParameters = {
                message: false,
                parameter: false,
                newParameters: false
            }
            if (!params.message) reject(console.error("FunctionCallError: The message parameter must be provided"));
            providedParameters.message = params.message;
            if (params.message.content) {
                providedParameters.message.content = params.message.content.toLowerCase();
            } else {
                providedParameters.message = params.message.toLowerCase();
            }
            if (params.parameter) {
                providedParameters.parameter = params.parameter;
            }
            if (params.newParameters) {
                providedParameters.newParameters = params.newParameters;
            }
            var parameters = new Map();
            const defaultParameters = [{
                aliases: ["-add", "-a", "-set", "-s"],
                name: "add"
            }, {
                aliases: ["-remove", "-rm", "-r", "-delete", "-d"],
                name: "remove"
            }, {
                aliases: ["-edit", "-e"],
                name: "edit"
            }, {
                aliases: ["-page", "-p"],
                name: "page"
            }, {
                aliases: ["-user", "-u"],
                name: "user"
            }, {
                aliases: ["-channel", "-chan", "-c"],
                name: "channel"
            }, {
                aliases: ["-role", "-r"],
                name: "role"
            }];
            defaultParameters.forEach(function(defaultParameter) {
                parameters.set(defaultParameter.name, defaultParameter);
            });
            if (providedParameters.newParameters) {
                if (Array.isArray(providedParameters.newParameters)) {
                    providedParameters.newParameters.forEach(function(newParameter) {
                        if (typeof newParameter !== "object") return reject("FunctionCallError: The new parameter must be an Object");
                        if ((!newParameter.aliases) || (!newParameter.name)) return reject("FunctionCallError: The new parameter object must contain a \"aliases\" Array property and a \"name\" String property");
                        if ((!Array.isArray(newParameter.aliases) || (newParameter.aliases.length < 1))) return reject("FunctionCallError: The new parameter aliases property must be an array and must not be empty");
                        if (typeof newParameter.name !== "string") return reject("FunctionCallError: The new parameter name property must be a string");
                        if (parameters.get(newParameter.name)) return reject("FunctionCallError: The new parameter supplied is already defined");
                        parameters.set(newParameter.name, newParameter);
                    });
                } else {
                    if (typeof providedParameters.newParameters !== "object") return reject("FunctionCallError: The new parameter must be an Object");
                    if ((!providedParameters.newParameters.aliases) || (!providedParameters.newParameters.name)) return reject("FunctionCallError: The new parameter object must contain a \"aliases\" Array property and a \"name\" String property");
                    if ((!Array.isArray(providedParameters.newParameters.aliases) || (providedParameters.newParameters.aliases.length < 1))) return reject("FunctionCallError: The new parameter aliases property must be an array and must not be empty");
                    if (typeof providedParameters.newParameters.name !== "string") return reject("FunctionCallError: The new parameter name property must be a string");
                    if (parameters.get(providedParameters.newParameters.name)) return reject("FunctionCallError: The new parameter supplied is already defined");
                    parameters.set(providedParameters.newParameters.name, providedParameters.newParameters);
                }
            }
            if (!providedParameters.parameter) { //Basically, if no parameters are supplied, return an array of objetcs of all matched parameters
                var matchedParameters = []
                parameters.forEach(function(param) {
                    parameters.get(param.name).aliases.forEach(function(alias) {
                        if (providedParameters.message.content.includes(alias)) {
                            if (matchedParameters.filter(m => m.name === param.name).length === 0) { //Dont push the same argument cause aliases ^
                                var substractArg = providedParameters.message.content.substr(providedParameters.message.content.indexOf(alias) + alias.length + 1).trim();
                                if (substractArg.includes("-")) {
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
                    return resolve(false);
                } else {
                    return resolve(matchedParameters);
                }
            } else { //Else return an object of the matched parameter
                if (!parameters.get(providedParameters.parameter)) throw "FunctionCallError: The supplied parameter does not exist";
                const searchParam = parameters.get(providedParameters.parameter);
                var match = false;
                searchParam.aliases.forEach(function(alias) {
                    if (match) return match; //Return the first match to avoid conflict with aliases
                    var providedMessage = providedParameters.message;
                    if (providedParameters.message.content) { //In case the given message is not a message
                        providedMessage = providedParameters.message.content;
                    }
                    var args = providedMessage.split(/\s+/gim);
                    args.shift();
                    args.forEach(function(arg) {
                        if (arg === alias) {
                            return match = {
                                position: providedMessage.indexOf(arg),
                                length: arg.length,
                                name: providedParameters.parameter
                            };
                        }
                    });
                });
                return resolve(match);
            }
        });
    }
}