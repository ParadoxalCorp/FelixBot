const logger = require(`../util/modules/logger.js`);
const sleep = require(`../util/modules/sleep.js`);
const request = require(`../util/modules/request`);

module.exports = async(client) => {
    logger.draft(`readying`, `create`, `Logging in...`);
    await sleep(1000);
    console.log(`===============================================\nGuilds: ${client.guilds.size}\nUsers: ${client.users.size}\nPrefix: ${client.config.prefix}\n===============================================`);
    logger.draft(`readying`, `end`, `Logged in as ${client.user.tag}, running Felix ${client.config.version}`, true);
    client.shards.forEach(shard => {
        shard.editStatus("online", {
            name: `Shard ${shard.id} | ${client.config.prefix}help for commands`
        });
    })
}