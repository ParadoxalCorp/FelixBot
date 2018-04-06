'use strict';

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