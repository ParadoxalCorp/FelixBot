'use strict';

module.exports = async(client, server) => {
    server.route({
        method: ['GET', 'PUT', 'POST'],
        path: '/api/userData/{userID?}',
        handler: (req, reply) => {
            //Return if no valid tokens are provided
            if (!req.headers.authorization || (!client.clientData.get("tokens").private.find(t => t.token === req.headers.authorization)) && !client.clientData.get("tokens").public.find(t => t.token === req.headers.authorization)) return reply("Forbidden");
            if (req.method === 'get') {
                //Return the whole database if no specific user id provided
                if (!req.params.userID) return reply(Array.from(client.userData.values()));
                //Else if an array is provided return an array of the specified ids
                else if (Array.isArray(typeof req.params.userID)) return reply(Array.from(client.userData.filter(g => req.params.userID.has(g.id))));
                //Finally return the specified id's user object
                reply(client.userData.get(req.params.userID))
            } else {
                if (!client.clientData.get("tokens").private.find(t => t.token === req.headers.authorization)) return reply("Forbidden: Public tokens can only access to GET endpoints");
                if (!req.payload || typeof req.payload !== 'object' || !req.payload.id) return reply(`No new user object was provided or the object is invalid`);
                client.userData.set(req.payload.id, req.payload);
                reply(true);
            }
        }
    });
}