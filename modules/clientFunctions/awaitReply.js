module.exports = async(client) => {
    client.awaitReply = async(params) => { //Default message collector function
        return new Promise(async(resolve, reject) => {
            var parameters = {
                message: false,
                embedObject: false,
                title: false,
                question: false,
                limit: 60000,
            }
            if (!params.message || (!params.embedObject && !params.title && !params.question)) return reject("FunctionCallError: The message, title and question parameters must be provided");
            parameters.message = params.message;
            if (params.embedObject) {
                parameters.embedObject = params.embedObject;
            }
            parameters.title = params.title;
            parameters.question = params.question;
            if (params.limit) {
                parameters.limit = params.limit;
            }
            var clientMessage;
            const filter = m => m.author.id === parameters.message.author.id;
            if (parameters.embedObject) {
                clientMessage = await parameters.message.channel.send(
                    parameters.embedObject
                ).catch(console.error);
            } else {
                clientMessage = await parameters.message.channel.send({
                    embed: {
                        title: parameters.title,
                        description: parameters.question,
                        footer: {
                            text: `Time limit: ${parameters.limit / 1000} seconds`
                        }
                    }
                }).catch(console.error);
            }
            try {
                const collected = await parameters.message.channel.awaitMessages(filter, {
                    max: 1,
                    time: parameters.limit,
                    errors: ["time"]
                });
                resolve({
                    reply: collected.first(),
                    question: clientMessage
                });
            } catch (e) {
                resolve({
                    reply: false,
                    question: clientMessage
                });
            }
        });
    }
}