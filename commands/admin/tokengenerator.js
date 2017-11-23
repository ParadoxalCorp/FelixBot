class TokenGenerator {
    constructor() {
        this.help = {
            name: 'tokengenerator',
            category: 'admin',
            usage: 'tokengenerator [new] [Public||Private?=Public] [User_ID]] || [list [Public||Private?=Public]] || [revoke [User_ID || token]]',
            description: `[Owner only] Generate API tokens`,
            detailedUsage: "`{prefix}tokengenerator new public 140149699486154753` Will generate and save a public token for the specified user id(user is just to retrieve tokens)"
        };
        this.conf = {
            aliases: ['token', `generatetoken`],
            ownerOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const tokens = client.clientData.has("tokens") ? client.clientData.get("tokens") : [];
                let isPublic = new RegExp(/private/gim).test(message.content) ? false : true;

                if (new RegExp(/new/gim).test(message.content)) {
                    let id = args.filter(a => !isNaN(a) && a.length >= 17)[0];
                    if (!id[0]) return resolve(await message.channel.createMessage(`:x: You need to provide a user id !`));
                    //Very cheap token generator
                    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '_', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', '$', 'u', 'r', 's', 't', 'u', 'v', '-', 'w', 'x', 'y', 'z'];
                    let token = new String();
                    for (let i = 0; i < 260; i++) {
                        if (i % 25 === 0 && i !== 0) token += ".";
                        else {
                            let random = Math.random();
                            if (random < 0.50) {
                                let randomLetter = Math.floor(Math.random() * ((alphabet.length - 1) + 1));
                                if (random < 0.25) token += alphabet[randomLetter].toUpperCase();
                                else token += alphabet[randomLetter];
                            } else token += Math.floor(Math.random() * (9 + 1));
                        }
                    }
                    tokens.push({ token: `${token}`, user: id, public: isPublic, requests: [] });
                    client.clientData.set("tokens", tokens);
                    resolve(await message.channel.createMessage({
                        embed: {
                            description: `Generated and stored the following token: \`\`\`js\n"${token}"\`\`\``
                        }
                    }));
                } else if (new RegExp(/list/gim).test(message.content)) {
                    let tokenList = tokens.map(t => `${t.user}(private: ${t.public}): "${t.token}"`).join("\n");
                    resolve(await message.channel.createMessage({
                        embed: {
                            description: "```js\n" + tokenList + "```"
                        }
                    }));
                } else if (new RegExp(/revoke/gim).test(message.content)) {
                    let id = args.filter(a => !isNaN(a) && a.length >= 17)[0];
                    let token = args.filter(a => a.length === 260)[0];
                    if (!id && !token) return resolve(await message.channel.createMessage(`:x: You need to specify a token or a user id to revoke`));
                    if (token) {
                        let tokenPos = tokens.findIndex(t => t.token === token);
                        if (tokenPos !== -1) return resolve(await message.channel.createMessage(`:x: That token does not exist`));
                        tokens.splice(tokenPos, 1);
                        client.clientData.set("tokens", tokens);
                        resolve(await message.channel.createMessage(`:white_check_mark: Successfully revoked the token \`${token}\``))
                    } else if (id) {
                        if (!tokens.find(t => t.user === id)) return resolve(await message.channel.createMessage(`:x: There is no token assigned to this user id`));
                        for (let i = 0; i < tokens.length; i++) {
                            if (tokens[i].user === id) tokens.splice(i, 1);
                        }
                        client.clientData.set("tokens", tokens);
                        resolve(await message.channel.createMessage(`:white_check_mark: Successfully revoked all of the tokens of the specified user`));
                    }
                }
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new TokenGenerator();