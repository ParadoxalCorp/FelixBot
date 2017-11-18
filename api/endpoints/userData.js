'use strict';

module.exports = async(client, server, PayloadValidator) => {
    server.route({
        method: ['GET', 'PUT', 'POST'],
        path: '/api/userData/{userID?}',
        handler: async(req, reply) => {
            try {
                const tokens = client.clientData.get("tokens");
                //Return if no valid tokens are provided
                const token = tokens.find(t => t.token === req.headers.authorization);
                if (!token) return reply("Forbidden").code(403);
                if (token.public && token.requests.filter(r => r.timestamp > Date.now() - 86400000).length > 500) return reply("Ratelimit reached: You may only use a public token 500 times a day").code(403);
                tokens[tokens.findIndex(t => t.token === req.headers.authorization)].requests.push({ timestamp: Date.now(), type: req.method });
                client.clientData.set("tokens", tokens);
                if (req.method === 'get') {
                    //Return the whole database if no specific user id provided
                    if (!req.params.userID) return reply(Array.from(client.userData.values()));
                    //Else if an array is provided return an array of the specified ids (with a cheap way to transform the string to an array)
                    if (new RegExp(/\[|\]/gim).test(req.params.userID)) req.params.userID = req.params.userID.substr(1, req.params.userID.length - 2).split(req.params.userID.includes(" ") ? ", " : ",");
                    if (Array.isArray(req.params.userID)) return reply(Array.from(client.userData.filter(u => req.params.userID.includes(u.id)).values()));
                    //Finally return the specified id's user object
                    let userEntry = client.userData.get(req.params.userID) || client.defaultUserData(req.params.userID);
                    let mutualGuilds = Array.from(client.guilds.filter(g => g.members.has(req.params.userID)).values());
                    if (!token.public) {
                        userEntry.mutualGuilds = mutualGuilds;
                    }
                    reply(userEntry)
                } else {
                    if (token.public) return reply("Forbidden: Public tokens can only access to GET endpoints").code(403);
                    if (!req.payload || typeof req.payload !== 'object') return reply(`No new user object was provided`);
                    let isValidObject = await PayloadValidator.validateUser(req.payload);
                    if (!isValidObject.valid) return reply(isValidObject.invalidKeys);
                    client.userData.set(req.payload.id, req.payload);
                    reply(true);
                }
            } catch (err) {
                console.error(err);
            }
        }
    });
}