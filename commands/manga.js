const popura = require('popura');
const malScraper = require('mal-scraper');

exports.run = async(client, message) => {
    const malClient = popura(client.config.malCredentials.name, client.config.malCredentials.password);
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/);
            args.shift();
            if (!args.length) return resolve(await message.channel.send(":x: You did not enter an manga to search for"));
            let mangaName = args.join(" ");
            const res = await malClient.searchMangas(mangaName);
            if (!res[0]) return resolve(await message.channel.send(":x: Your search did not returned any result"));
            let embedFields = [];
            let selectedManga = res[0];
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
                    return resolve(await message.channel.send(":x: Timeout: Command aborted"));
                }
                if (isNaN(reply.reply.content) || reply.reply.content > res.length || reply.reply.content < 1) {
                    if (message.guild && message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) await reply.reply.delete();
                    await reply.query.delete();
                    return resolve(await message.channel.send(":x: You did not enter a whole number or the number you specified is not valid"));
                }
                selectedManga = res[Math.round(reply.reply.content - 1)];
                if (reply.reply.deletable) reply.reply.delete();
                reply.query.delete();
            }
            if (selectedManga.chapters) {
                embedFields.push({
                    name: ':book: Chapters',
                    value: selectedManga.chapters.toString(),
                    inline: true
                });
            }
            if (selectedManga.volumes) {
                embedFields.push({
                    name: ':books: Volumes',
                    value: selectedManga.chapters.toString(),
                    inline: true
                })
            }
            if (selectedManga.score) {
                embedFields.push({
                    name: ':star: Score',
                    value: selectedManga.score.toString(),
                    inline: true
                });
            }
            if (selectedManga.type) {
                embedFields.push({
                    name: ':projector: Type',
                    value: selectedManga.type
                });
            }
            if (selectedManga.status) {
                embedFields.push({
                    name: ':tv: Status',
                    value: selectedManga.status,
                    inline: true
                });
            }
            if (selectedManga.start_date) {
                embedFields.push({
                    name: ':calendar: Start date',
                    value: selectedManga.start_date.replace(/-/g, "/"),
                    inline: true
                });
            }
            if (selectedManga.end_date && selectedManga.end_date !== '0000-00-00') {
                embedFields.push({
                    name: ':calendar: End date',
                    value: selectedManga.end_date.replace(/-/g, "/"),
                    inline: true
                });
            }
            if (selectedManga.synopsis) {
                if (selectedManga.synopsis.length > 1024) selectedManga.synopsis = selectedManga.synopsis.substr(0, 1021) + '..';
                embedFields.push({
                    name: ':notepad_spiral: Synopsis',
                    value: selectedManga.synopsis.replace(/(&quot;|&mdash;|&rsquo;|&#039;|\[i]|\[\/i])/gim, ""),
                });
            }
            return resolve(await message.channel.send({
                embed: {
                    title: selectedManga.title,
                    url: 'https://mymangalist.net/',
                    image: {
                        url: selectedManga.image
                    },
                    fields: embedFields
                }
            }));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: true,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'manga',
    description: 'Search for the specified manga through MymangaList',
    usage: 'manga Dragon Ball',
    category: 'utility',
};