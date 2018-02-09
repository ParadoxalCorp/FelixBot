"use strict";

module.exports = async(client, server, PayloadValidator) => {
    server.route({
        method: ['PUT', 'POST'],
        path: '/api/postUserData',
        handler: async(req, reply) => {
            try {
                const tokens = client.clientData.get("tokens");
                //Return if no valid tokens are provided
                if (req.headers.authorization) req.headers.authorization = req.headers.authorization.split("Bearer ")[1];
                const token = tokens.find(t => t.token === req.headers.authorization);
                if (!token || token.public) return reply("Forbidden").code(403);
                tokens[tokens.findIndex(t => t.token === req.headers.authorization)].requests.push({ timestamp: Date.now(), type: req.method });
                client.clientData.set("tokens", tokens);
                if (!req.payload || typeof req.payload !== 'object') return reply(`No new user object was provided`);
                let isValidObject = await PayloadValidator.validateUser(req.payload);
                if (!isValidObject.valid) return reply(isValidObject.invalidKeys).code(400);
                client.userData.set(req.payload.id, req.payload);
                reply(req.payload);
            } catch (err) {
                console.error(err);
            }
        }
    });
}