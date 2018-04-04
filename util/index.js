module.exports = (client) => {
    return {
        database: process.argv.includes('--no-db') ? false : new(require('./helpers/DatabaseWrapper'))(client),
        refs: require('./helpers/references'),
        log: require('./modules/log'),
        timeConverter: require('./modules/timeConverter'),
        messageCollector: new(require('./helpers/messageCollector'))(client.bot),
        IPCHandler: new(require('./helpers/IPCHandler'))(client),
        sleep: require(`./modules/sleep.js`)
    };
};