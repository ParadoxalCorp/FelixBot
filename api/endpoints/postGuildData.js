'use strict';

module.exports = async(client, server, PayloadValidator) => {
    server.route({
        method: ['POST', 'PUT'],
        path: '/api/postGuildData',
        handler: async(req, reply) => {
            try {
                const tokens = client.clientData.get("tokens");
                //Return if no valid tokens are provided
                if (req.headers.authorization) req.headers.authorization = req.headers.authorization.split("Bearer ")[1];
                const token = tokens.find(t => t.token === req.headers.authorization);
                if (!token || token.public) return reply("Forbidden").code(403);
                if (!req.payload || typeof req.payload !== 'object') return reply(`No new guild object was provided`);
                let isValidObject = await PayloadValidator.validateGuild(req.payload);
                if (!isValidObject.valid) return reply(isValidObject.invalidKeys).code(400);
                client.guildData.set(req.payload.id, req.payload);
                reply(req.payload);
            } catch (err) {
                console.error(err);
            }
        }
    });
}