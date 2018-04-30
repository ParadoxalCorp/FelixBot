const dailyEvents = (economyManager) => {
    return [{
        id: 20000,
        message: 'I forgot how much i have to give you, well here\'s something',
        changeRate: [-30, -40],
        conditionalVariants: [],
    }, {
        id: 20001,
        message: 'I forgot how much i have to give you, well here\'s something',
        changeRate: [30, 40],
        conditionalVariants: [],
    }];
};

module.exports = dailyEvents;