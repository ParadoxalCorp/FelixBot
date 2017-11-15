'use strict';

module.exports = async(client, server, PayloadValidator) => {
    server.route({
        method: ['GET', 'PUT', 'POST'],
        path: '/api/guildData/{guildID?}',
        handler: async(req, reply) => {
            const tokens = client.clientData.get("tokens");
            //Return if no valid tokens are provided
            const token = tokens.find(t => t.token === req.headers.authorization);
            if (!token) return reply("Forbidden").code(403);
            tokens[tokens.findIndex(t => t.token === req.headers.authorization)].requests.push({ timestamp: Date.now(), type: req.method });
            client.clientData.set("tokens", tokens);
            if (req.method === 'get') {
                //Return the whole database if no specific guild id provided
                if (!req.params.guildID) return reply(Array.from(client.guildData.values()));
                //Else if an array is provided return an array of the specified ids
                if (new RegExp(/\[|\]/gim).test(req.params.guildID)) req.params.guildID = req.params.guildID.substr(1, req.params.guildID.length - 2).split(req.params.guildID.includes(" ") ? ", " : ",");
                if (Array.isArray(req.params.guildID)) return reply(Array.from(client.guildData.filter(g => req.params.guildID.includes(g.id)).values()));
                //Finally return the specified id's guild object
                reply(client.guildData.get(req.params.guildID))
            } else {
                if (token.public) return reply("Forbidden: Public tokens can only access to GET endpoints").code(403);
                if (!req.payload || typeof req.payload !== 'object') return reply(`No new guild object was provided`);
                let isValidObject = await PayloadValidator.validateGuild(req.payload);
                if (!isValidObject.valid) return reply(isValidObject.invalidKeys);
                client.guildData.set(req.payload.id, req.payload);
                reply(true);
            }
        }
    });
}