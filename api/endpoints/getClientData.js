'use strict';

module.exports = async(client, server, PayloadValidator) => {
    server.route({
        method: ['GET'],
        path: '/api/getClientData/{clientValue}',
        handler: async(req, reply) => {
            try {
                const tokens = client.clientData.get("tokens");
                //Return if no valid tokens are provided
                if (req.headers.authorization) req.headers.authorization = req.headers.authorization.split("Bearer")[1].trim();
                const token = tokens.find(t => t.token === req.headers.authorization);
                if (!token || token.public) return reply("Forbidden").code(403);
                tokens[tokens.findIndex(t => t.token === req.headers.authorization)].requests.push({ timestamp: Date.now(), type: req.method });
                client.clientData.set("tokens", tokens);
                return reply(client[req.params.clientValue].first ? Array.from(client[req.params.clientValue].values()) : client[req.params.clientValue]);
            } catch (err) {
                console.error(err);
            }
        }
    });
}