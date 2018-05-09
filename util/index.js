module.exports = (client) => {
    return {
        database: process.argv.includes('--no-db') ? false : new(require('./helpers/modules/databaseWrapper'))(client),
        refs: require('./helpers/data/references'),
        log: require('./modules/log'),
        timeConverter: require('./modules/timeConverter.js'),
        messageCollector: new(require('./helpers/modules/messageCollector'))(client.bot),
        IPCHandler: new(require('./helpers/modules/IPCHandler'))(client),
        sleep: require('./modules/sleep.js'),
        reloader: new(require('./helpers/modules/reloader'))(client),
        getRandomNumber: require('./modules/getRandomNumber'),
        redact: require('./helpers/modules/redact').bind(null, client),
        economyManager: new(require('./helpers/modules/economyManager'))(client),
        paginate: require('./modules/paginate'),
        reactionCollector: new(require('./helpers/modules/reactionCollector'))(client.bot),
        traverse: require('./modules/traverse'),
        interactiveList: new(require('./helpers/modules/interactiveList'))(client),
        extendedUser: require('./helpers/modules/extendedUser'),
        extendedUserEntry: require('./helpers/modules/extendedUserEntry'),
        extendedGuildEntry: require('./helpers/modules/extendedGuildEntry')
    };
};