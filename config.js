module.exports = {
    //Multiple "admins" of the bot, they will have access to most of the admins commands
    admins: ["your_ID", "trusted_collaborator_ID", "another_trusted_collaborator_ID"],
    prefix: "uwu.",
    ownerID: "your_ID",
    botID: "bot_ID",
    //The token of the bot application to connect to, it is required.
    token: "",
    database: {
        //Unless the database is on another server, the host should stay like this
        host: "127.0.0.1",
        //The port should be the client driver port, not the administrative HTTP connection nor the intracluster one
        port: 28015
    },
    //Additional API keys that the bot use for commands for example
    apiKeys: {
        raven: "",
    },
	botLists: {
        terminal: {
            token: "",
            url: ""
        }
    },
    //Some customizable bot features options, purpose is to be able to quickly change critical values without having to do so in 100 files 
    options: {
        embedColor: 0x7a0099,
        dailyCoins: 2500,
        dailyCooldown: 86400000,
        coinsLimit: 100000000000000000000,
        economyEvents: {
			slotsEvents: true,
			dailyEvents: true,
            //Chances out of 100 that a daily event will occur when using daily
            dailyEventsRate: 50,
            //Chances out of 100 that a slots event will occur when using slots
            slotsEventsRate: 35
		}
    },
	process: {
        guildsPerShards: 1750,
        shards: 1,
        clusters: 1,
        debug: true
    }
};
