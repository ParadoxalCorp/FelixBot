const popura = require('popura');
const malScraper = require('mal-scraper');

class Anime {
    constructor() {
        this.help = {
            name: 'anime',
            description: 'Search for the specified anime through MyAnimeList',
            usage: 'anime One Piece'
        }
        this.conf = {
            require: ["malCredentials"]
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            const malClient = popura(client.config.malCredentials.name, client.config.malCredentials.password);
            try {
                if (!args.length) return resolve(await message.channel.createMessage(":x: You did not enter an anime to search for"));
                let animeName = args.join(" ");
                const res = await malClient.searchAnimes(animeName);
                if (!res[0]) return resolve(await message.channel.createMessage(":x: Your search did not returned any result"));
                let embedFields = [];
                let selectedAnime = res[0];
                if (res.length > 1) {
                    let i = 1;
                    let resultList = res.map(a => `[${i++}] ${a.title}`).join('\n').replace(/undefined/gim, "");
                    if (resultList.length > 2030) resultList = resultList.substr(0, 2030) + '..';
                    const reply = await message.awaitReply({
                        message: {
                            embed: {
                                title: ":mag: Your search has returned more than one result, select one by typing a number",
                                description: "```\n" + resultList + "```"
                            }
                        }
                    });
                    if (!reply.reply) {
                        reply.query.delete();
                        return resolve(await message.channel.createMessage(":x: Timeout: Command aborted"));
                    }
                    if (isNaN(reply.reply.content) || reply.reply.content > res.length || reply.reply.content < 1) {
                        if (message.guild && message.guild.members.get(client.user.id).hasPermission("manageMessages")) await reply.reply.delete();
                        await reply.query.delete();
                        return resolve(await message.channel.createMessage(":x: You did not enter a whole number or the number you specified is not valid"));
                    }
                    selectedAnime = res[Math.round(reply.reply.content - 1)];
                    if (reply.reply.deletable) reply.reply.delete();
                    reply.query.delete();
                }
                const anime = await malScraper.getInfoFromName(selectedAnime.title);
                if (anime.genres.length > 0) {
                    embedFields.push({
                        name: ':open_file_folder: Genres',
                        value: anime.genres.join(', '),
                        inline: true
                    });
                }
                if (anime.studios.length > 0) {
                    embedFields.push({
                        name: ':film_frames: Studio',
                        value: anime.studios.join(', '),
                        inline: true
                    })
                }
                if (selectedAnime.episodes) {
                    embedFields.push({
                        name: ':1234: Episodes',
                        value: selectedAnime.episodes.toString(),
                        inline: true
                    });
                }
                if (selectedAnime.score) {
                    embedFields.push({
                        name: ':star: Score',
                        value: selectedAnime.score.toString(),
                        inline: true
                    });
                }
                if (selectedAnime.type) {
                    embedFields.push({
                        name: ':projector: Type',
                        value: selectedAnime.type
                    });
                }
                if (selectedAnime.status) {
                    embedFields.push({
                        name: ':tv: Status',
                        value: selectedAnime.status,
                        inline: true
                    });
                }
                if (selectedAnime.start_date) {
                    embedFields.push({
                        name: ':calendar: Start date',
                        value: selectedAnime.start_date.replace(/-/g, "/"),
                        inline: true
                    });
                }
                if (selectedAnime.end_date && selectedAnime.end_date !== '0000-00-00') {
                    embedFields.push({
                        name: ':calendar: End date',
                        value: selectedAnime.end_date.replace(/-/g, "/"),
                        inline: true
                    });
                }
                if (selectedAnime.synopsis) {
                    if (selectedAnime.synopsis.length > 1024) selectedAnime.synopsis = selectedAnime.synopsis.substr(0, 1021) + '..';
                    embedFields.push({
                        name: ':notepad_spiral: Synopsis',
                        value: selectedAnime.synopsis.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, ""),
                    });
                }
                return resolve(await message.channel.createMessage({
                    embed: {
                        title: selectedAnime.title,
                        url: anime.url || 'https://myanimelist.net/',
                        image: {
                            url: selectedAnime.image
                        },
                        fields: embedFields,
                        footer: {
                            text: (anime.scoreStats || "") +
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