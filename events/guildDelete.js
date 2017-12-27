const request = require(`../util/modules/request.js`);

module.exports = async(client, guild) => {
    client.emit("guildCountUpdate");
}