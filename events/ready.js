const logger = require(`../util/modules/logger.js`);
const sleep = require(`../util/modules/sleep.js`);
const request = require(`../util/modules/request`);

module.exports = async(client) => {
    logger.draft(`login`, `create`, `Logging in...`);
    await sleep(1000); //Wait for the data to be loaded into the client
    logger.draft(`login`, `end`, `Logged in as ${client.user.tag}, running Felix ${client.coreData.version}`, true);
    await sleep(1000);
    console.log(`===============================================\nGuilds: ${client.guilds.size}\nUsers: ${client.users.size}\nPrefix: ${client.config.prefix}\n===============================================`);
    client.shards.forEach(shard => {
        shard.editStatus("online", {
            name: `Shard ${shard.id} | ${client.config.prefix}help for commands`
        });
    });

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //Get upvoters
    if (client.config.discordBotList) {
        let result = await request.get(`https://discordbots.org/api/bots/${client.user.id}/votes`, { 'Authorization': client.config.discordBotList }).catch(err => client.emit(`error`, err));
        if (!Array.isArray(result.data)) {
            client.emit('error', result.data);
        };
        client.upvoters = result.data;
        //Update upvoters every 30 min
        client._upvoteInterval = setInterval(async() => {
            let result = await request.get(`https://discordbots.org/api/bots/${client.user.id}/votes`, { 'Authorization': client.config.discordBotList }).catch(err => client.emit(`error`, err));
            if (!Array.isArray(result.data)) {
                return client.emit('error', result.data);
            };
            client.upvoters = result.data;
        }, 1800000);
        //Launch status change interval
        client._statusInterval = setInterval(async() => {
            if (!client.upvoters || !client.upvoters.length) return;
            let publicUpvoters = client.upvoters.filter(u => client.userData.has(u.id) && client.userData.get(u.id).dataPrivacy.publicUpvote);
            client.shards.forEach(shard => {
                let upvoterPosition = getRandomNumber(publicUpvoters.length - 1, 0);
                shard.editStatus("online", {
                    name: `with ${publicUpvoters[upvoterPosition].username}#${publicUpvoters[upvoterPosition].discriminator} | ${client.config.prefix}help for commands | Shard ${shard.id}`
                });
            })
        }, 60000)
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
}