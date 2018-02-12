'use strict';

const Collection = require("eris").Collection;
const _ = require("underscore");
const getLevelDetails = require('../../util/helpers/getLevelDetails');

module.exports = async(client, server, PayloadValidator) => {
    server.route({
        method: ['GET'],
        path: '/api/getUserData/{userID}',
        handler: async(req, reply) => {
            try {
                const tokens = client.clientData.get("tokens");
                //Return if no valid tokens are provided
                if (req.headers.authorization) req.headers.authorization = req.headers.authorization.split("Bearer")[1].trim();
                const token = tokens.find(t => t.token === req.headers.authorization);
                if (!token) return reply("Forbidden").code(403);
                if (token.public && token.requests.filter(r => r.timestamp > Date.now() - 86400000).length > 500) return reply("Ratelimit reached: You may only use a public token 500 times a day").code(429);
                tokens[tokens.findIndex(t => t.token === req.headers.authorization)].requests.push({ timestamp: Date.now(), type: req.method });
                client.clientData.set("tokens", tokens);
                //If an array is provided return an array of the specified ids (with a cheap way to transform the string to an array)
                if (new RegExp(/\[|\]/gim).test(req.params.userID)) req.params.userID = req.params.userID.substr(1, req.params.userID.length - 2).split(req.params.userID.includes(" ") ? ", " : ",");
                if (Array.isArray(req.params.userID)) return reply(client.userData.filterArray(u => req.params.userID.includes(u.id)));
                //Else return the specified id's user object
                let userEntry = client.userData.get(req.params.userID) || client.defaultUserData(req.params.userID);
                userEntry.levelDetails = getLevelDetails(userEntry.experience.level, userEntry.experience.exp);
                if (!token.public) {
                    let mutualGuilds = client.guilds.filterArray(g => g.members.has(userEntry.id));
                    mutualGuilds = _.map(mutualGuilds, _.clone);
                    mutualGuilds.forEach(g => {
                        let guildPos = mutualGuilds.findIndex(guild => guild.id === g.id);
                        mutualGuilds[guildPos].channels = Array.from(mutualGuilds[guildPos].channels.values());
                        mutualGuilds[guildPos].roles = Array.from(mutualGuilds[guildPos].roles.values());
                        mutualGuilds[guildPos].members = Array.from(mutualGuilds[guildPos].members.values());
                        mutualGuilds[guildPos].userPermissions = client.guilds.get(g.id).members.get(req.params.userID) ? client.guilds.get(g.id).members.get(req.params.userID).permission.json : undefined;
                        mutualGuilds[guildPos].database = client.guildData.get(g.id);
                        delete mutualGuilds[guildPos].client; //Too complex data structures so stringifying that shit is not really possible
                        mutualGuilds[guildPos].userPermissions = new Array();
                        client.commands.forEach(c => {
                            let allowed = require("../../util/helpers/permissionsChecker.js")(client, {
                                author: client.users.get(req.params.userID),
                                guild: client.guilds.get(g.id)
                            }, c);
                            mutualGuilds[guildPos].userPermissions.push({
                                name: c.help.name,
                                allowed: allowed
                            });
                        });
                    });
                    userEntry.mutualGuilds = mutualGuilds;
                }
                reply(userEntry);
            } catch (err) {
                console.error(err);
            }
        }
    });
}