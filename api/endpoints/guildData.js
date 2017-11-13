'use strict';

module.exports = async(client, server) => {
    server.route({
        method: ['GET', 'PUT', 'POST'],
        path: '/api/guildData/{guildID?}',
        handler: (req, reply) => {
            //Return if no valid tokens are provided
            if (!req.headers.authorization || (!client.clientData.get("tokens").private.find(t => t.token === req.headers.authorization)) && !client.clientData.get("tokens").public.find(t => t.token === req.headers.authorization)) return reply("Forbidden");
            if (req.method === 'get') {
                //Return the whole database if no specific guild id provided
                if (!req.params.guildID) return reply(Array.from(client.guildData.values()));
                //Else if an array is provided return an array of the specified ids
                else if (isArray(typeof req.params.guildID)) return reply(Array.from(client.guildData.filter(g => req.params.guildID.has(g.id))));
                //Finally return the specified id's guild object
                reply(client.guildData.get(req.params.guildID))
            } else {
                if (!client.clientData.get("tokens").private.find(t => t.token === req.headers.authorization)) return reply("Forbidden: Public tokens can only access to GET endpoints");
                if (!req.payload || typeof req.payload !== 'object' || !req.payload.id) return reply(`No new guild object was provided or the object is invalid`);
                client.guildData.set(req.payload.id, req.payload);
                reply(true);
            }
        }
    });
}