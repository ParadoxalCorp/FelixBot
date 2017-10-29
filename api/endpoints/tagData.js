'use strict';

module.exports = async(client, server) => {
    server.route({
        method: ['GET', 'PUT'],
        path: '/api/tagData/{tagName?}',
        handler: (req, reply) => {
            if (req.method === 'get') {
                if (!req.params.tagID) return reply(`tag name is needed for GET requests`);
                reply(client.tagData.get(req.params.tagName))
            } else {
                if (!req.payload || typeof req.payload !== 'object' || !req.payload.id) return reply(`No new tag object was provided or the object is invalid`);
                client.tagData.set(req.payload.name, req.payload);
                reply(true);
            }
        }
    });
}