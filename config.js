module.exports = {
    admins: ["YOUR_ID", "SOMEONE_TRUSTABLE", "A_SECOND_TRUSTABLE_PERSON_IF_YOU_KNOW_ANY_IDK"],
    prefix: "felix",
    //User Settings > Appearance > Enable Developer Mode > Right click on your username and the click "Copy ID". There, you got your Discord ID
    ownerID: "YOUR_ID",
    //Toke is needed
    token: "baguette",
    database: {
        //Unless the database is on another server, the host should stay like this
        host: "127.0.0.1",
        //The port should be the client driver port, not the administrative HTTP connection nor the intracluster one
        port: 28015,
        //You shouldn't need to change this unless you run multiple instances of the bot and ony one instance of RethinkDB; In that case, you can use different databases
        database: 'data',
        //The username to connect as
        user: 'admin',
        //If a password is set, the password to connect with (in case the server has a public address and the RethinkDB instance is set to not only be available locally)
        password: ''
    },
    //Additional API keys that the bot use for commands for example
    apiKeys: {
        sentryDSN: "",
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
        coinsLimit: 1e20,
        economyEvents: {
            slotsEvents: true,
            dailyEvents: true,
            //Chances out of 100 that a daily event will occur when using daily
            dailyEventsRate: 50,
            //Chances out of 100 that a slots event will occur when using slots
            slotsEventsRate: 35
        },
        //If given, Felix will use this animated emotes to animate the slots command; Should look like this: <a:animatedslots:443420980170326036> 
        animatedSlotsEmote: '',
        //Roughly allows the use of 4 commands within the given period before ratelimits may apply
        defaultCooldownWeight: 5,
        //Duration in milliseconds the command cooldown may last, setting it to something like 1000 would effectively disable it
        commandCooldownDuration: 20000,
        experience: {
            exponent: 1.5,
            baseXP: 100,
            /* The gainFormula option give enormous control over the system, unless you know EXACTLY what you are doing, you should ONLY change the numbers
             * The default logic is: If the message length is under 500 characters, give 5 experience, otherwise, apply the formula
             * The default formula gives a minimum of 5 experience (500 characters) and a maximum of 20 experience (2000 characters) */
            gainFormula: (length) => length < 500 ? 5 : Math.round(1 * length / 100),
            //Time in milliseconds before a user may gain experience with a message again
            cooldown: 30000
        }
    },
    process: {
        guildsPerShards: 1750,
        shards: 1,
        clusters: 1,
        debug: true,
        environment: 'production'
    }
};