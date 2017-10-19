const unirest = require("unirest");

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let punchLinks = ['https://imgur.com/j6YGjQ5', 'https://imgur.com/wuAdVR7', 'https://imgur.com/VkBZ2z4', 'https://imgur.com/hBgl9as', 'https://imgur.com/AObIGqV', 'https://imgur.com/HHdbvDh', 'https://imgur.com/zKxUzOG', 'https://imgur.com/CvjCIQN', 'https://imgur.com/u7SzkEY', 'https://imgur.com/Ht0IVA9', 'https://imgur.com/LJYvAKa', 'https://imgur.com/j0xliMY', 'https://imgur.com/qzJXFW8', 'https://imgur.com/pZqIoJc', 'https://imgur.com/QVPPvkV', 'https://imgur.com/WC0aLio', 'https://imgur.com/tSf7Q9f', 'https://imgur.com/xU6OkEl', 'https://imgur.com/DNkVySg', 'https://imgur.com/ctHoTwl']
            var users = await client.getUserResolvable(message, {
                guildOnly: true
            });
            let punchUrl = punchLinks[Math.floor(Math.random() * ((punchLinks.length - 1) - 0 + 1)) + 0];
            if (users.get(message.author.id)) users.delete(message.author.id); //Remove the author from the users 
            resolve(await message.channel.send({
                embed: {
                    description: users.size > 0 ? `Hey ${users.map(u => '**' + u.tag + '**').join(", ")}, you've just been punched by **${message.author.tag}**` : '',
                    image: {
                        url: `${punchUrl}.gif` //Otherwise wont be resolved
                    },
                }
            }));
            resolve(await message.channel.send({
                embed: {
                    image: {
                        url: `${punchUrl}.gif` //Otherwise wont be resolved
                    },
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
    name: 'punch',
    description: 'punch someone owo',
    usage: 'punch user resolvable',
    category: 'image'
};