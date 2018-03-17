const logger = require(`../util/modules/logger.js`);
const sleep = require(`../util/modules/sleep.js`);
const request = require(`../util/modules/request`);

module.exports = async(client) => {
    logger.draft(`login`, `create`, `Logging in...`);
    await sleep(1000); //Wait for the data to be loaded into the client
    if (!client.user.bot) {
        logger.draft(`login`, `end`, `Invalid login details were provided, the process will exit`, false);
        process.exit(0);
    }
    logger.draft(`login`, `end`, `Logged in as ${client.user.tag}, running Felix ${client.coreData.version}`, true);
    await sleep(1000);
    console.log(`===============================================\nGuilds: ${client.guilds.size}\nUsers: ${client.users.size}\nPrefix: ${client.config.prefix}\n===============================================`);
    client.shards.forEach(shard => {
        shard.editStatus("online", {
            name: `${client.config.prefix}help for commands | Shard ${shard.id}`
        });
    });

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //Get image types
    if (client.config.wolkeImageKey) {
        let result = await request.get(`https://api.weeb.sh/images/types`, { 'Authorization': `Bearer ${client.config.wolkeImageKey}`, 'User-Agent': 'FelixBot' }).catch(err => client.emit(`error`, err));
        if (!result.data || result.data.status !== 200) client.emit(`error`, result.data);
        else client.imageTypes = result.data.types;
        require(`../util/helpers/generateImageSubcommands.js`)(client);
        //Update image types every 12 hour
        client._imageTypesInterval = setInterval(async() => {
            result = await request.get(`https://api.weeb.sh/images/types`, { 'Authorization': `Bearer ${client.config.wolkeImageKey}`, 'User-Agent': 'FelixBot' }).catch(err => client.emit(`error`, err));
            if (!result.data || result.data.status !== 200) return client.emit(`error`, result.data);
            client.imageTypes = result.data.types;
            require(`../util/helpers/generateImageSubcommands.js`)(client);
        }, 43200000);
    }

    //Update guilds count every hour
    client._guildsCountUpdateInterval = setInterval(() => {
        if (client.config.discordBotList) {
            request.post(`https://discordbots.org/api/bots/${client.user.id}/stats`, { server_count: client.guilds.size }, { 'Authorization': client.config.discordBotList })
                .then(res => {
                    logger.log(`Updated guilds count on DiscordBots.org to ${client.guilds.size}`, 'INFO');
                })
                .catch(err => {
                    client.emit('error', err);
                });
        }
        if (client.config.discordBotFr) {
            request.post(`https://discordbot.takohell.com/api/v1/bot/${client.user.id}`, { server_count: client.guilds.size, shard_count: client.shards.size }, { 'Authorization': client.config.discordBotFr, 'Content-Type': 'application/json' })
                .then(res => {
                    logger.log(`Updated guilds count on discorbot.takohell.com to ${client.guilds.size}`, 'INFO');
                })
                .catch(err => {
                    client.emit('error', err);
                });
        }
        if (client.config.terminalBotList) {
            request.post(`https://ls.terminal.ink/api/v1/bots/${client.user.id}`, { server_count: client.guilds.size }, { 'Authorization': client.config.terminalBotList, 'Content-Type': 'application/json' })
                .then(res => {
                    logger.log(`Updated guilds count on ls.terminal.ink to ${client.guilds.size}`, 'INFO');
                })
                .catch(err => {
                    client.emit('error', err);
                });
        }
    }, 3600000);
}