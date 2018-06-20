const slotsEvents = (client, economyManager) => {
    return [{
        id: 10000,
        message: 'A cat runs into you and steals \`{value}\` holy coins from your gains !',
        changeRate: [-40, -60],
        conditionalVariants: [{
            condition: (userEntry) => userEntry.hasItem(1000),
            success: `You win ! But... A cat runs into you and steals \`{value}\` holy coins from your gains ! But your ${economyManager.getItem(1000).name} catches it and gets your gains back !`,
            fail: `A cat runs into you and steals \`{value}\` holy coins from your gains ! But your ${economyManager.getItem(1000).name} catches it and... wait, your ${economyManager.getItem(1000).name} got beaten by the cat !`,
            successRate: 85
        }],
        case: 'won'
    }, {
        id: 10001,
        message: 'The slots machine seems to have pity of you, and gives you back \`{value}\` of your coins',
        changeRate: [40, 60],
        conditionalVariants: [],
        case: 'lost'
    }, {
        id: 10002,
        message: 'A pirate ship attack and steals `{value}` from your gains!',
        changeRate: [-60, -80],
        conditionalVariants: [{
            condition: (userEntry) => userEntry.economy.items.find(i => economyManager.getItem(i.id).data && economyManager.getItem(i.id).data.type === 'Destroyer'),
            context: (userEntry) => {
                return {
                    success: `A pirate ship is suspiciously approaching the coast, but as soon as their intent to steal you becomes clear, torpedoes hit their broadside and sink the ship. Those torpedoes were from your **${economyManager.marketItems.filter(i => i.data && i.data.type === 'Destroyer' && userEntry.hasItem(i.id))[client.getRandomNumber(0, economyManager.marketItems.filter(i => i.data && i.data.type === 'Destroyer' && userEntry.hasItem(i.id)).length - 1)].name}** !`,
                    fail: '',
                    successRate: 100
                };
            }
        }, {
            condition: (userEntry) => userEntry.economy.items.find(i => economyManager.getItem(i.id).data && economyManager.getItem(i.id).data.type === 'Battleship'),
            context: (userEntry) => {
                return {
                    success: `A pirate ship is suspiciously approaching the coast, but as soon as their intent to steal you becomes clear, you hear loud gun fires and notice that they come from your **${economyManager.marketItems.filter(i => i.data && i.data.type === 'Battleship' && userEntry.hasItem(i.id))[client.getRandomNumber(0, economyManager.marketItems.filter(i => i.data && i.data.type === 'Battleship' && userEntry.hasItem(i.id)).length - 1)].name}** ! Her main battery guns instantly sank the pirate ship`,
                    fail: '',
                    successRate: 100
                };
            }
        }],
        case: 'won'
    }];
};

module.exports = slotsEvents;