module.exports = {
    //An array of trustable peoples IDs, put yours as well since in most case this is checked rather than the ownerID
    admins: ["TRUSTABLE_PEOPLE_ID_1", "TRUSTABLE_PEOPLE_ID_2", "WHY_NOT_A_THIRD"],
    //The default prefix, this will be one by default on each new server and in dm
    prefix: "uwu.",
    //Your ID
    ownerID: "YOUR_ID",
    //API key for different bot lists, in a selfhost case, leave that false
    discordBotList: false,
    discordBotFr: false,
    terminalBotList: false,
    //API key for weeb.sh, in a selfhost case you won't be able to get one and therefore most of the image commands will be disabled
    wolkeImageKey: false,
    //Account credentials on MyAnimeList, this will be used for anime commands
    malCredentials: {
        name: false, //"should be "USERNAME"
        password: false //"should be "PASSWORD"
    },
	//Google Geocoding API
	googleGeoAPIkey: false,
	//Dark Sky API (weather)
	DarkSkyAPIKey: false,
	//Bitly shortener login & API
	bitlyApiKey: [false, false],
	//Google shortener API key
	googleShortenerApiKey: false,
    //RapidAPI API key
    rapidApiKey: false,
    //Steam API key
    steamApiKey: false,
	//Raven error tracker url
	raven: false,
    //Whatanime.ga API key (still not implemented)
    whatAnimeKey: false,
    //Actually needed: The token of the bot, won't work without it
    token: "TOKEN",
	 //Some customizable options 
    options: {
        //The activity countdown (time before a user may win experience with a message again, in milliseconds)
        activityCooldown: 30000,
        //The love cooldown (time before a user love point may refill, in milliseconds)
        loveCooldown: 43200000,
        //The daily cooldown (time before a user can use daily again, in milliseconds)
        dailyCooldown: 86400000,
        //The amount of points given when using the daily command
        dailyPoints: 500,
    		pointsLimit: 99999999999999999999,
		    //Time in milliseconds before the afk status of someone should be reset
        afkReset: 43200000
    }
};
