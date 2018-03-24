const log = require(`../util/modules/log`);
const sleep = require(`../util/modules/sleep.js`);

module.exports = async(client) => {
    await sleep(1000); //Wait for the data to be loaded into the client
    if (!client.user.bot) {
        log.error(`Invalid login details were provided, the process will exit`);
        process.exit(0);
    }
    client.prefixes.push(`<@${client.user.id}>`, `<@!${client.user.id}>`);
    log.info(`Logged in as ${client.user.username}#${client.user.discriminator}, running Yuuri ${require('../package').version}`);
    await sleep(1000);
    console.log(`===============================================\nGuilds: ${client.guilds.size}\nUsers: ${client.users.size}\nPrefix: ${client.config.prefix}\n===============================================`);
    client.shards.forEach(shard => {
        shard.editStatus("online", {
            name: `${client.config.prefix}help for commands | Shard ${shard.id}`
        });
    });
};