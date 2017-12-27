class Choose {
    constructor() {
        this.help = {
            name: 'choose',
            description: 'Make felix choose between some stuff',
            usage: 'choose owo ; uwu ; owo + uwu?'
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well, i need some stuff to choose from, i can't choose from nothing sadly :v`));
                let choices = args.join(' ').split(/;|\|/).filter(c => c && c !== ' '); //Filter empty choices :^)
                if (choices.length < 2) return resolve(await message.channel.createMessage(`:x: Welp i need to choose from at least two things, i mean what's the point in choosing between only one thing?`));
                let choice = choices[Math.floor(Math.random() * choices.length)].trim();
                resolve(await message.channel.createMessage(`I choose \`${choice}\`!`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Choose();