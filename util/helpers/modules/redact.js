'use strict';

/**
 * A function that replace all critical credentials from a string (e.g: token, api keys, database host...). Useful to filter out eval and repl outputs
 * @param {*} client - The client instance
 * @param {string} string - The string to replace credentials for
 * @returns {string} The given strings with credentials replaced
 */
const redact = (client, string) => {
    let credentials = [client.config.token, client.config.database.host];
    const secondaryCredentials = [
        client.config.apiKeys.sentryDSN, 
        client.config.database.password, 
        client.config.botLists.terminal.token, 
        client.config.apiKeys.weebSH,
        client.config.options.music.password,
        client.config.options.music.host
    ];
    for (const value of secondaryCredentials) {
        if (value) {
            credentials.push(value);
        }
    }
    const credentialRX = new RegExp(
        credentials.join('|'),
        'gi'
    );

    return string.replace(credentialRX, 'baguette');
};

module.exports = redact;