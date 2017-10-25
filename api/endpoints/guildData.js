'use strict';

module.exports = async(client, server) => {
    server.route({
        method: ['GET', 'PUT'],
        path: '/api/guildData/{guildID?}',
        handler: (req, reply) => {
            if (req.method === 'get') {
                if (!req.params.guildID) return reply(`guild ID is needed for GET requests`);
                reply(client.guildData.get(req.params.guildID))
            } else {
                if (!req.payload || typeof req.payload !== 'object' || !req.payload.id) return reply(`No new guild object was provided or the object is invalid`);
                client.guildData.set(req.payload.id, req.payload);
                reply(true);
            }
        }
    });
}