module.exports = (client) => {
    return {
        database: process.argv.includes('--no-db') ? false : new(require('./helpers/DatabaseWrapper'))(client),
        refs: require('./helpers/references'),
        log: require('./modules/log'),
        timeConverter: require('./modules/timeConverter'),
        messageCollector: new(require('./helpers/messageCollector'))(client.bot),
        IPCHandler: new(require('./helpers/IPCHandler'))(client),
        sleep: require('./modules/sleep.js'),
        reloader: new(require('./helpers/reloader'))(client),
        getRandomNumber: require('./modules/getRandomNumber'),
        redact: require('./helpers/redact').bind(null, client),
        economyManager: new(require('./helpers/economyManager'))(client),
        paginate: require('./modules/paginate'),
        reactionCollector: new(require('./helpers/reactionCollector'))(client.bot),
        traverse: require('./modules/traverse'),
        interactiveList: new(require('./helpers/interactiveList'))(client),
        extendedUser: require('./helpers/extendedUser'),
        extendedUserEntry: require('./helpers/extendedUserEntry')
    };
};