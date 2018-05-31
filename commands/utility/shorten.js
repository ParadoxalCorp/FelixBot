class Shorten {
    constructor() {
        this.help = {
            name: 'shorten',
            description: 'Takes a URL as input, and shortens it',
            usage: 'shorten https://github.com bit.ly',
			detailedUsage: '`prefix.shorten https://google.com goo.gl` will create a goo.gl link.\n' +
			'`prefix.shorten https://google.com bit.ly` will create a bit.ly link.\n' +
			'`prefix.shorten https://goo.gl/xUqyLn -unshorten` will unshorten the link.'
        };
        this.conf = {
            require: ["googleShortenerApiKey", "bitlyApiKey"]
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
			if (!args[0]) return resolve(await message.channel.createMessage(":x: No url specified"));
			const request = require("../../util/modules/request.js");
			
			if (!args.includes("-unshorten")){
				if (args[1] == "goo.gl" || !args[1]){
					const key = client.config.googleShortenerApiKey;
					var result = await request.post(`https://www.googleapis.com/urlshortener/v1/url?key=${key}`, {"longUrl": args[0]}	, {'Content-Type': 'application/json'});
					if (!result.data) return resolve(await message.channel.createMessage(":x: An error occurred :v"));
					resolve(await message.channel.createMessage(embedResults(result.data.longUrl, result.data.id)));
				} else if (args[1] == "bit.ly"){
					const key = client.config.bitlyApiKey;
					var result = await request.get(`https://api-ssl.bitly.com/v3/shorten?login=${key[0]}&apiKey=${key[1]}&longUrl=${args[0]}`);
					if (!result.data) return resolve(await message.channel.createMessage(":x: An error occurred :v"));
					resolve(await message.channel.createMessage(embedResults(result.data.data.long_url, result.data.data.url)));
				}
			} else {
				if (args[0].includes("bit.ly")) {
					const key = client.config.bitlyApiKey;
					var result = await request.get(`https://api-ssl.bitly.com/v3/expand?login=${key[0]}&apiKey=${key[1]}&shortUrl=${args[0]}`);
					console.log(result.data.data.expand[0].long_url);
					if (!result.data) return resolve(await message.channel.createMessage(":x: An error occurred :v"));
					resolve(await message.channel.createMessage(embedResults(result.data.data.expand[0].short_url, result.data.data.expand[0].long_url)));
				} else if (args[0].includes("goo.gl")) {
					const key = client.config.googleShortenerApiKey;
					var result = await request.get(`https://www.googleapis.com/urlshortener/v1/url?key=${key}&shortUrl=${args[0]}`);
					if (!result.data) return resolve(await message.channel.createMessage(":x: An error occurred :v"));
					resolve(await message.channel.createMessage(embedResults(result.data.id, result.data.longUrl)));
				} else return resolve(await message.channel.createMessage(":x: Only `bit.ly` and `goo.gl` allowed!"));
			}
			
			function embedResults(new_url, old_url){
					return {embed: {
					title : ":link: Shorten results",
					fields:  [{
						name: "**Old:**",
						value: new_url
					},{
						name: "**New:**",
						value: old_url
					}],
					timestamp: new Date()}
			}}
            } catch (err) {
                reject(err);
            }
        });	
    }
}

module.exports = new Shorten();
