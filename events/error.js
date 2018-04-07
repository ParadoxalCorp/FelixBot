'use strict';

module.exports = async(client, err, message) => {
    process.send({ name: 'error', msg: `Error: ${err}\nStacktrace: ${err.stack}\nMessage: ${message ? message.content : 'None'}` });
    if (message) {
        if (client.config.admins.includes(message.author.id)) {
            message.channel.createMessage({
                embed: {
                    title: ':x: An error occurred',
                    description: '```js\n' + (err.stack || err) + '```'
                }
            }).catch();
        } else {
            message.channel.createMessage({
                embed: {
                    title: ':x: An error occurred :v',
                    description: `If the issue persist, this is most likely because i miss permissions to do this.\n\nIf however even with enough permissions the issue still exist, don't hesitate to join the [support server](<https://discord.gg/Ud49hQJ>)`
                }
            }).catch();
        }
    }
};