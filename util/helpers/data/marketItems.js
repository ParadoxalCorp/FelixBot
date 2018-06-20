const marketItems = [{
    id: 1000,
    name: 'dog',
    description: 'A dog, the legend says that dogs are relatively effective against cats',
    buyableOnce: true,
    family: 'Animals',
    price: 50000,
    emote: ':dog:'
}, {
    id: 2000,
    name: 'Asakaze',
    description: 'Completed the 16 June 1923, the Asakaze was a IJN Minekaze-class destroyer. She featured 4 Type 3 120 mm 45 caliber naval guns and 3x2 530mm torpedo tubes.\n\nShips can come in handy for a number of tasks, for example dealing with pirates',
    buyableOnce: true,
    family: 'Ships',
    data: {
        type: 'Destroyer',
        flagship: false
    },
    price: 1e6,
    emote: ':ship:',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_destroyer_Asakaze_around_1924.jpg/300px-Japanese_destroyer_Asakaze_around_1924.jpg'
}, {
    id: 2001,
    name: 'Hiei',
    description: 'The Hiei, first commissioned the 4 August 1914, was a IJN Kongō-class fast-battleship. After her 1935 refit, she featured 4x2 356mm main battery turrets and a relatively strong armor.\n\nShips can come in handy for a number of tasks, for example dealing with pirates',
    buyableOnce: true,
    family: 'Ships',
    data: {
        type: 'Battleship',
        flagship: false
    },
    price: 2e6,
    emote: ':ship:',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Japanese_Battleship_Hiei.jpg/220px-Japanese_Battleship_Hiei.jpg'
}, {
    id: 2002,
    name: 'Yuudachi',
    description: 'Poi, i mean, Yūdachi, nowadays more commonly known as Yuudachi, was a IJN Shiratsuyu-class destroyer. Commissioned the 7 January 1937, She was part of the mightiest destroyers of her time, featuring a set of 2x4 610mm torpedo tubes. As of now, Yuudachi is also a Discord bot available [here](https://bots.discord.pw/bots/388799526103941121) that you should check out (totally not advertising hello yes)\n\nShips can come in handy for a number of tasks, for example dealing with pirates',
    buyableOnce: true,
    family: 'Ships',
    data: {
        type: 'Destroyer',
        flagship: false
    },
    price: 1e6,
    emote: ':ship:',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Yudachi_II.jpg/300px-Yudachi_II.jpg'
}, {
    id: 3000,
    name: 'Love point',
    description: 'Gives an extra love point to use',
    buyableOnce: false,
    family: 'Perks',
    //Note that guildEntry may be undefined if the message was sent in DM, and anyway won't be saved if modified, it's for read-only purposes
    price: (client, guildEntry, userEntry) => 1e7 * userEntry.cooldowns.loveCooldown.max,
    emote: ':heart:',
    //Note that guildEntry may be undefined if the message was sent in DM, and anyway won't be saved if modified, it's for read-only purposes
    run: (client, guildEntry, userEntry) => userEntry.cooldowns.loveCooldown.max++
}];

module.exports = marketItems;