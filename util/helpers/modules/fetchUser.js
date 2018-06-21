/* eslint-disable valid-jsdoc */

'use strict';

const Endpoints = require('../../../node_modules/eris/lib/rest/Endpoints');
const User = require('../../../node_modules/eris/lib/structures/User');

/**
 * 
 * @param {string} id - The ID of the user to fetch
 * @returns {object} The user object
 */
const fetchUser = async(client, id) => {
    if (client.bot.users.has(id)) {
      return client.bot.users.get(id);
    } else {
      return client.bot.requestHandler.request('GET', Endpoints.USER(id), true)
        .catch(e => {
          if (e.message.includes('Unknown User')) {
            return null;
          }
        }).then(u => {
            if (!u) {
                return u;
            }
            const newUser = new User(u);
            client.bot.users.set(id, new User(u));
            return newUser;
        });
    }
};

module.exports = fetchUser;