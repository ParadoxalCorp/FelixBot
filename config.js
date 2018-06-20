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
        database: "data",
        //The username to connect as
        user: "admin",
        //If a password is set, the password to connect with (in case the server has a public address and the RethinkDB instance is set to not only be available locally)
        password: ""
    },
    //Additional API keys that the bot use for commands for example
    apiKeys: {
        sentryDSN: "",
        weebSH: ""
    },
    //This define whether to only disable or to also remove the commands which requires an API key/package that is missing, you may want to set that to true if you don't plan to use these commands
    removeDisabledCommands: false,
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
        loveCooldown: 86400000,
        //Defines how often in milliseconds to update the generated images sub-commands if there is any new types
        imageTypesInterval: 43200000,        
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
        animatedSlotsEmote: "",
        //Roughly allows the use of 4 commands within the given period before ratelimits may apply
        defaultCooldownWeight: 5,
        //Duration in milliseconds the command cooldown may last, setting it to something like 1000 would effectively disable it
        commandCooldownDuration: 20000,
        //Define how many roles can be set to be given to new members
        maxDefaultRoles: 3,
        experience: {
            exponent: 1.5,
            baseXP: 100,
            /* The gainFormula option give enormous control over the system, unless you know EXACTLY what you are doing, you should ONLY change the numbers
             * The default logic is: If the message length is under 500 characters, give 5 experience, otherwise, apply the formula
             * The default formula gives a minimum of 5 experience (500 characters) and a maximum of 20 experience (2000 characters) */
            gainFormula: (length) => length < 500 ? 5 : Math.round(1 * length / 100),
            /* Like the gainFormula option, unless you know EXACTLY what you are doing, you should ONLY change the numbers
             * The default logic is: If the total size of the files uploaded is above 10e6 then it will be multiplied by 0.0000005, otherwise, it returns 5
             * This default logic gives a minimum of 5 experience, but no actual maximum 
             * Though, even with nitro and really large files, you shouldn't get much more than 25 */
            uploadGainFormula: (size) => size > 10e6 ? Math.round(0.0000005 * size) : 5,
            //Time in milliseconds before a user may gain experience with a message again
            cooldown: 30000,
            /* This is rather more complicated, this actually define how often (in milliseconds too) the cooldowns are checked and lifted if they're over
             * In practice, even if the cooldown is (by default) 30 seconds, it may not be lifted directly after 30 seconds
             * For example, if the latest sweep was a second before the 30 seconds passed, the cooldown will be lifted 9 seconds after, so 39 seconds after the message was sent
             * This allow for better performance at a large scale, but also prevent automated experience farming, as you can't accurately know how long the cooldown will take */
            sweepInterval: 10000,
            //This define the limit of roles that can be given at the same level
            maxRolesPerLevel: 3,
            //Define what is the maximum level at which you can set roles to be given at
            maxRolesLevel: 1000,
            defaultLevelUpMessage: "Hai **%USERTAG%**, you just reached the level %LEVEL% %WONROLES% !"
        },
        music: {
            //If true, Felix will try to connect to the Lavalink server (meaning that you must launch the server), if a success, the music feature will be enabled
            enabled: false,
            //The password and port set in the "application.yml" file that should be in the same folder if you downloaded Lavalink
            password: 'youshallnotpass',
            port: 2033,
            WSPort: 80,
            //Define how long in milliseconds to wait for a song to be added when the last one ended before leaving to not waste bandwidth. Defaults to 30e4 ms (5 minutes)
            inactivityTimeout: 30e4,
            //Define how long in milliseconds before a vote to skip a song should end
            voteSkipDuration: 60000,  
            //The host of the Lavalink server, if the Lavalink server is hosted on another server, you should change to that server IP
            host: 'localhost'
        }
    },
    process: {
        guildsPerShards: 1750,
        shards: 1,
        clusters: 1,
        debug: true,
        environment: "production"
    }
};