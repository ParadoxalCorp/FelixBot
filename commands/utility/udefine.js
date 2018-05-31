class Udefine {
    constructor() {
        this.help = {
            name: 'udefine',
            description: 'Search defintions through urbandictionary',
            usage: 'udefine pizza'
        };
        this.conf = {
            aliases: ["urdef", "define", "urban"]
        };
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
			if (!args[0]) return resolve(await message.channel.createMessage(":x: No search term specified"));
			const request = require("../../util/modules/request.js");
			var searchTerm = args.join("+").toString();
			var result = await request.get(`http://api.urbandictionary.com/v0/define?term=${searchTerm}`);
			if (!result.data) return resolve(await message.channel.createMessage(":x: an error occured"));
			if (result.data.result_type == "no_results") return resolve(await message.channel.createMessage("No results :v"));
			var f_result = result.data.list[0];
			resolve(await message.channel.createMessage({embed: {
					color: 0xff8040,
					title : `${args.join(" ")} results`,
					url: f_result.permalink,
					fields:  [{
						name: "**Definition:**",
						value: f_result.definition
					},{
						name: "**Example:**",
						value: '*' + f_result.example + '*'
					},{
						name: "**Author:**",
						value: f_result.author
					}],
					footer:{
						text: `👍${f_result.thumbs_up}|${f_result.thumbs_down}👎 www.urbandictionary.com`
					},
					timestamp: new Date()}
			}));
            } catch (err) {
                reject(err);
		}
        });	
    }
}

module.exports = new Udefine();
