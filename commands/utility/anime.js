const malScraper = require('mal-scraper');

class Anime {
    constructor() {
        this.help = {
            name: 'anime',
            description: 'Search for the specified anime through MyAnimeList',
            usage: 'anime One Piece'
        };
        this.conf = {
            require: ["malCredentials"]
        };
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) {
                    return resolve(await message.channel.createMessage(":x: You did not enter an anime to search for"));
                }
                let animeName = args.join(" ");
                const res = await malScraper.getResultsFromSearch(animeName);
                if (!res[0]) {
                    return resolve(await message.channel.createMessage(":x: Your search did not returned any result"));
                }
                let embedFields = [];
                let selectedAnime = res[0];
                if (res.length > 1) {
                    let i = 1;
                    const reply = await message.awaitReply({
                        message: {
                            embed: {
                                description: "owo, i found multiple animes corresponding to your search, please select one with its number ```\n" + res.map(a => `[${i++}] ${a.name}`).join('\n') + "```"
                            }
                        }
                    });
                    if (!reply.reply) {
                        reply.query.delete();
                        return resolve(await message.channel.createMessage(":x: Timeout: Command aborted"));
                    }
                    if (!res[reply.reply.content - 1]) {
                        reply.reply.delete().catch(() => {});
                        reply.query.delete().catch(() => {});
                        return resolve(await message.channel.createMessage(":x: You did not enter a whole number or the number you specified is not valid"));
                    }
                    selectedAnime = res[reply.reply.content - 1];
                    reply.reply.delete().catch(() => {});
                    reply.query.delete().catch(() => {});
                }
                let anime = await malScraper.getInfoFromURL(selectedAnime.url);
                if (anime.japaneseTitle) {
                    embedFields.push({
                        name: 'Japanese name',
                        value: anime.japaneseTitle,
                        inline: true
                    });
                }
                if (anime.type) {
                    embedFields.push({
                        name: 'Type',
                        value: anime.type,
                        inline: true
                    });
                }
                if (anime.characters && anime.characters[0]) {
                    embedFields.push({
                        name: 'Characters',
                        value: anime.characters.map(c => `[${c.name}](${c.link}) (${c.role})`).splice(0, 10).join(', ') + (anime.characters.length > 10 ? '...' : '')
                    });
                }
                if (anime.score) {
                    embedFields.push({
                        name: 'Score',
                        value: anime.score,
                        inline: true
                    });
                }
                if (anime.status) {
                    embedFields.push({
                        name: 'Status',
                        value: anime.status,
                        inline: true
                    });
                }
                if (anime.genres) {
                    embedFields.push({
                        name: 'Genres',
                        value: anime.genres.join(', ')
                    });
                }
                if (anime.episodes) {
                    embedFields.push({
                        name: 'Episodes',
                        value: anime.episodes,
                        inline: true
                    });
                }
                if (anime.aired) {
                    embedFields.push({
                        name: 'Aired',
                        value: anime.aired,
                        inline: true
                    });
                }
                if (anime.studios) {
                    embedFields.push({
                        name: 'Studios',
                        value: anime.studios.join(', ')
                    });
                }
                if (anime.synopsis) {
                    anime.synopsis = anime.synopsis.length > 1015 ? `${anime.synopsis.substr(0, 1015)}...` : anime.synopsis;
                    anime.synopsis = anime.synopsis.replace(/\[i\]|\[\/i\]/gm, '**');
                    embedFields.push({
                        name: 'Synopsis',
                        value: anime.synopsis
                    });
                }
                const nsfwRatings = ['Rx', 'R+'];
                return resolve(await message.channel.createMessage({
                    embed: {
                        title: anime.title,
                        url: selectedAnime.url && (!nsfwRatings.filter(r => anime.rating.includes(r))[0] || message.channel.nsfw) ? selectedAnime.url : 'https://myanimelist.net/',
                        image: {
                            url: anime.picture && (!nsfwRatings.filter(r => anime.rating.includes(r))[0] || message.channel.nsfw) ? anime.picture : undefined
                        },
                        fields: embedFields,
                        footer: {
                            text: (anime.scoreStats ? anime.scoreStats.charAt(0).toUpperCase() + anime.scoreStats.substr(1) : "") +
                                " | Popularity: " + (anime.popularity || 'None') + " | Members: " + (anime.members || 'None') + " | Ranking: " + (anime.ranked || 'None') + " | Rating: " + (anime.rating || 'None')
                        }
                    }
                }));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Anime();