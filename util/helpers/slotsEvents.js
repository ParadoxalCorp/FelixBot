const slotsEvents = (economyManager) => {
    return [{
        id: 10000,
        message: 'A cat run into you and steals \`{value}\` holy coins from your gains !',
        changeRate: [-40, -60],
        conditionalVariants: [{
            condition: (userEntry) => userEntry.hasItem(1000),
            success: `A cat run into you and steals \`{value}\` holy coins from your gains ! But your ${economyManager.getItem(1000).name} catch it and gets your gains back !`,
            fail: `A cat run into you and steals \`{value}\` holy coins from your gains ! But your ${economyManager.getItem(1000).name} catch it and... wait, your ${economyManager.getItem(1000).name} got beaten by the cat !`,
            successRate: 75
        }],
        case: 'won'
    }, {
        id: 10001,
        message: 'The slots machine seems to have pity of you, and gives you back \`{value}\` of your coins',
        changeRate: [40, 60],
        conditionalVariants: [],
        case: 'lost'
    }];
};

module.exports = slotsEvents;