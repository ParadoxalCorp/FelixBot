'use strict';

module.exports = async(client, server, PayloadValidator) => {
    server.route({
        method: ['GET'],
        path: '/api/getGuildData/{guildID}',
        handler: async(req, reply) => {
            const tokens = client.clientData.get("tokens");
            //Return if no valid tokens are provided
            if (req.headers.authorization) req.headers.authorization = req.headers.authorization.split("Bearer")[1].trim();
            const token = tokens.find(t => t.token === req.headers.authorization);
            if (!token) return reply("Forbidden").code(403);
            if (token.public && token.requests.filter(r => r.timestamp > Date.now() - 86400000).length > 500) return reply("Ratelimit reached: You may only use a public token 500 times a day").code(429);
            //If an array is provided return an array of the specified ids
            if (new RegExp(/\[|\]/gim).test(req.params.guildID)) req.params.guildID = req.params.guildID.substr(1, req.params.guildID.length - 2).split(req.params.guildID.includes(" ") ? ", " : ",");
            if (Array.isArray(req.params.guildID)) return reply(Array.from(client.guildData.filter(g => req.params.guildID.includes(g.id)).values()));
            //Else return the specified id's guild object
            reply(client.guildData.get(req.params.guildID))
        }
    });
}