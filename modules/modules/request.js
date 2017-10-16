const unirest = require('unirest');

module.exports = async(client, message, args) => {
    /**
     * Shortcut to add a self-assignable role
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    const request = async function(url, header) {
        return new Promise(async(resolve, reject) => {
            unirest.get(url)
                .header(`${header ? header.header : null}`, `${header ? header.value : null}`)
                .end(response => {
                    resolve(response);
                });
        });
    }
    client.request = request;
}