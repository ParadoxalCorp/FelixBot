module.exports = (client) => {
    return {
        //In case of a complete reload of the modules, ignore the critical modules
        database: client.database ? client.database : (process.argv.includes('--no-db') ? false : new(require('./helpers/modules/databaseWrapper'))(client)),
        refs: require('./helpers/data/references'),
        log: require('./modules/log'),
        timeConverter: require('./modules/timeConverter.js'),
        messageCollector: new(require('./helpers/modules/messageCollector'))(client.bot),
        IPCHandler: client.IPCHandler ? client.IPCHandler : new(require('./helpers/modules/IPCHandler'))(client),
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
        extendedGuildEntry: require('./helpers/modules/extendedGuildEntry'),
        prompt: require('./modules/prompt'),
        isWholeNumber: require('./modules/isWholeNumber'),
        getLevelDetails: require('./helpers/modules/getLevelDetails').bind(null, client),
        experienceHandler: new(require('./helpers/modules/experienceHandler'))(client),
        moduleIsInstalled: require('./modules/moduleIsInstalled'),
        imageHandler: new(require('./helpers/modules/imageHandler'))(client),
        fetchUser: require('./helpers/modules/fetchUser').bind(null, client),
        musicManager: client.musicManager ? client.musicManager : new(require('./helpers/modules/musicManager'))(client)
    };
};