'use strict';

module.exports = async(client, server) => {
    server.route({
        method: ['GET', 'PUT'],
        path: '/api/userData/{userID?}',
        handler: (req, reply) => {
            if (req.method === 'get') {
                if (!req.params.userID) return reply(`User ID is needed for GET requests`);
                reply(client.userData.get(req.params.userID))
            } else {
                if (!req.payload || typeof req.payload !== 'object' || !req.payload.id) return reply(`No new user object was provided or the object is invalid`);
                client.userData.set(req.payload.id, req.payload);
                reply(true);
            }
        }
    });
}