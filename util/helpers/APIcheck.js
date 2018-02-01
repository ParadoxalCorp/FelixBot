module.exports = { run :(config, Felix, logger) => {
if (!config.DarkSkyAPIKey) {
	let requireDarkSkyAPIKey	 = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("DarkSkyAPIKey"));
	requireDarkSkyAPIKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`DarkSkyAPIKey\` API Key is missing`);
	logger.log(`No DarkSky API Key found in the config, disabled: ${requireDarkSkyAPIKey.map(c => c.help.name).join(", ")}`, `warn`);
}
if (!config.googleGeoAPIkey) {
	let requireGoogleGeoAPIkey	 = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("googleGeoAPIkey"));
	requireGoogleGeoAPIkey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`googleGeoAPIkey\` API Key is missing`);
	logger.log(`No Google Geolocation API key found in the config, disabled: ${requireGoogleGeoAPIkey.map(c => c.help.name).join(", ")}`, `warn`);
}
if (!config.googleGeoAPIkey) {
	let requireGoogleGeoAPIkey	 = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("googleGeoAPIkey") || c.conf.require && c.conf.require.includes("bitlyApiKey"));
	requireGoogleGeoAPIkey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`bitlyApiKey\`  and the \`googleGeoAPIkey\`API key which are missing`);
	logger.log(`No Google Geolocation API found in the config, disabled: ${requireGoogleGeoAPIkey.map(c => c.help.name).join(", ")}`, `warn`);
}
if (!config.bitlyApiKey || !config.googleShortenerApiKey) {
	let requireURLshortenAPIKEY	 = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("googleShortenerApiKey") || c.conf.require && c.conf.require.includes("bitlyApiKey"));
	requireURLshortenAPIKEY.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`bitlyApiKey\`  and the \`googleShortenerApiKey\`API key which are missing`);
	logger.log(`No google or bitly api key found in the config, disabled: ${requireURLshortenAPIKEY.map(c => c.help.name).join(", ")}`, `warn`);
}
if (!config.raven) logger.log(`No raven link found in the config, errors will be logged to the console`, "warn");
if (!config.wolkeImageKey) {
	let requirewolkeImageKey = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("wolkeImageKey"));
	requirewolkeImageKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`wolkeImageKey\` API key which is missing`);
	logger.log(`No weeb.sh API key found in the config, disabled: ${requirewolkeImageKey.map(c => c.help.name).join(", ")}`, `warn`);
}
if (!config.malCredentials || !config.malCredentials.password || !config.malCredentials.name) {
	let requiremalCredentials = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("malCredentials"));
	requiremalCredentials.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`malCredentials\` name and password fields which are missing`);
	logger.log(`No MyAnimeList credentials found in the config, disabled ${requiremalCredentials.map(c => c.help.name).join(", ")}`, `warn`);
}
if (!config.rapidApiKey) {
	let requirerapidApiKey = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("rapidApiKey"));
	requirerapidApiKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`rapidApiKey\` API key which is missing`);
	logger.log(`No rapid API API (yes, they're named rapidAPI so i have to write two times API, don't hurt me pls) key found in the config, disabled ${requirerapidApiKey.size > 0 ? requirerapidApiKey.map(c => c.help.name).join(", ") : "nothing"}`, `warn`);
}
if (!config.steamApiKey) {
	let requiresteamApiKey = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("steamApiKey"));
	requiresteamApiKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`steamApiKey\` API key which is missing`);
	logger.log(`No Steam API key found in the config, disabled ${requiresteamApiKey.size > 0 ? requiresteamApiKey.map(c => c.help.name).join(", ") : "nothing"}`, `warn`);
}
}};

