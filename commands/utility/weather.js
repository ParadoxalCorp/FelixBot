class Weather {
    constructor() {
        this.help = {
            name: 'weather',
            description: 'Check weather reports world wide',
            usage: 'weather Netherlands Hilversum'
        };
        this.conf = {
            require: ["googleGeoAPIkey", "DarkSkyAPIKey"]
        };
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
			const GoogleKey = client.config.googleGeoAPIkey;
			const DarkSkyKey = client.config.DarkSkyAPIKey;
			if (!args[0]) return resolve(await message.channel.createMessage("Specify an address kthnx"));
			const request = require("../../util/modules/request.js");
			var G_result = await request.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${args.join("+").toString()}&key=${GoogleKey}`);
			if (G_result.data.error || G_result.data.error) return resolve(await message.channel.createMessage(":x: address not found :v"));
			if (G_result.data.status == "ZERO_RESULTS") return resolve(await message.channel.createMessage(":x: address not found :v"));
			var Geo = new Object;
			Geo.address = G_result.data.results[0].formatted_address;
			Geo.lat = G_result.data.results[0].geometry.location.lat;
			Geo.lng = G_result.data.results[0].geometry.location.lng;
			var result = (await request.get(`https://api.darksky.net/forecast/${DarkSkyKey}/${Geo.lat},${Geo.lng}?exclude=currently,minutely,daily,alerts,flags`)).data.hourly;
			resolve(await message.channel.createMessage({embed: {
					hexColor: '#ffff00',
					title: getIcon() + ' Weather report',
					description: result.summary,
					fields:  [{
						name: "Location",
						value: Geo.address.replace(/,/g , "\n"),
						inline: true
					},{
						name: "Summary",
						value: result.data[0].summary,
						inline: true
					},{
						name: "Temperature",
						value: Math.round( result.data[0].temperature * 10 ) / 10  + '°F\n' + Math.round( (result.data[0].temperature-32)*(5/9) * 10 ) / 10  + '°C',
						inline: true
					},{
						name: "Precipitation",
						value: Math.round(result.data[0].precipProbability) * 100 + '%, ' + result.data[0].precipType,
						inline: true
					},{
						name: "Humidity",
						value: Math.round(result.data[0].humidity * 100) + '%',
						inline: true
					},{
						name: "Wind speed",
						value: Math.round( result.data[0].windSpeed * 10 ) / 10  + 'm/h\n' + Math.round( result.data[0].windSpeed * 1.609344 * 10 ) / 10  + 'km/h',
						inline: true
					}],
					footer:{
						text: 'powered by https://darksky.net'
					},
					timestamp: new Date()}
			}));
			
			function getIcon(){
				if (result.icon == 'clear-day')return ':city_sunset:';
				if (result.icon == 'clear-night')return ':night_with_stars:';
				if (result.icon == 'rain')return ':cloud_rain:';
				if (result.icon == 'snow')return ':cloud_snow:';
				if (result.icon == 'snow')return ':cloud_rain:';
				if (result.icon == 'wind')return ':dash:';
				if (result.icon == 'fog')return ':foggy:';
				if (result.icon == 'cloudy')return ':cloud:';
				if (result.icon == 'partly-cloudy-day')return ':white_sun_small_cloud:';
				if (result.icon == 'partly-cloudy-night')return ':night_with_stars:';
				return '';
			}

            } catch (err) {
                reject(err);
		}
        });
    }
}

module.exports = new Weather();
