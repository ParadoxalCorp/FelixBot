'use strict';

/**
 * A function that replace all critical credentials from a string (e.g: token, api keys, database host...). Useful to filter out eval and repl outputs
 * @param {*} client - The client instance
 * @param {string} string - The string to replace credentials for
 * @returns {string} The given strings with credentials replaced
 */
const redact = (client, string) => {
    const credentialRX = new RegExp(
        [
            client.config.token,
            client.config.database.host
        ].join('|'),
        'gi'
    );

    return string.replace(credentialRX, 'baguette');
};

module.exports = redact;