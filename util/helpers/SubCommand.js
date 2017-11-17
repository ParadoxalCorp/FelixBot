class SubCommand {
    constructor(options) {
        this.help = options.help;
        this.conf = options.conf;
        this.shortcuts = options.shortcuts;
        this.run = options.run;
        this.subcommand = true;
    }
}

module.exports = SubCommand;