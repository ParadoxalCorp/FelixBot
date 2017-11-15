/* eslint-disable no-console */
//Made by the fucking awesome Aetheryx#2222
const chalk = new(require('chalk')).constructor({
    enabled: true
});
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const types = {
    warn: 'yellow',
    error: 'red',
    info: 'green'
};
require('draftlog').into(console);
class Logger {
    constructor() {
        this.drafts = new Map();
        this.chalk = chalk;
    }

    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    log(message, type, returnString) {
        const log = chalk[types[type] || 'green'](`[${Date().toString().split(' ').slice(1, 5).join(' ')}, ${type ? type.toUpperCase() : 'INFO'}] `) + message;
        if (returnString) return log;
        else console.log(log);
    }

    async draft(name, type, string, succeed) {
        if (!process.stderr.isTTY) {
            return this.log(string);
        }
        switch (type) {
            case 'create':
                {
                    this.drafts.set(name, {
                        spinning: true,
                        string,
                        draft: console.draft(this.log(`${frames[0]} ${string}`, 'info', true))
                    });
                    let index = 0;
                    while (this.drafts.get(name).spinning) {
                        await this.sleep(50);
                        this.drafts.get(name).draft(this.log(`${frames[index % frames.length]} ${string}`, 'info', true));
                        index++;
                    }
                    break;
                }
            case 'edit':
                {
                    //Stop the old draft
                    this.drafts.get(name).spinning = false;
                    await this.sleep(50);
                    //Update the draft 
                    this.drafts.get(name).draft(this.log(`${frames[0]} ${string}`, 'info', true));
                    let index = 0;
                    //Re-enable the spinning
                    this.drafts.get(name).spinning = true;
                    while (this.drafts.get(name).spinning) {
                        await this.sleep(50);
                        this.drafts.get(name).draft(this.log(`${frames[index % frames.length]} ${string}`, 'info', true));
                        index++;
                    }
                    break;
                }
            case 'end':
                this.drafts.get(name).spinning = false;
                await this.sleep(50);
                this.drafts.get(name).draft(this.log(`${succeed ? '✔' : '✖'} ${string}`, 'info', true));
                this.drafts.delete(name);
                break;
        }
    }
}
module.exports = new Logger();