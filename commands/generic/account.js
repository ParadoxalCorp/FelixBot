class Account {
    constructor() {
        this.help = {
            name: 'account',
            usage: 'account profile_privacy private',
            description: 'Enter your account settings, where you can reset your data or change some of your data privacy (only stuff related to Felix ofc)'
        }
        this.shortcut = {
            triggers: new Map([
                ['points_privacy', {
                    script: 'setPointsPrivacy.js',
                    args: 1,
                    help: 'Set your points privacy(whether or not you\'ll appear in the leaderboard), valid privacies are `Public` and `Private`'
                }],
                ['love_privacy', {
                    script: 'setLovePrivacy.js',
                    args: 1,
                    help: 'Set your love points privacy(whether or not you\'ll appear in the leaderboard), valid privacies are `Public` and `Private`'
                }],
                ['level_privacy', {
                    script: 'setLevelPrivacy.js',
                    args: 1,
                    help: 'Set your global level/experience privacy(whether or not you\'ll appear in the leaderboard), valid privacies are `Public` and `Private`'
                }],
                ['profile_privacy', {
                    script: 'setProfilePrivacy.js',
                    args: 1,
                    help: 'Set your profile privacy, if you set it to private, the `profile` command wont display your profile. Valid privacies are `Public` and `Private`'
                }],
                ['reset_level', {
                    script: 'resetLevel.js',
                    help: 'Reset your global level/experience'
                }],
                ['reset_everything', {
                    script: 'resetEverything.js',
                    help: 'Reset all your data, that includes love points, global experience...'
                }],
                ['choose_lang', {
                    script: 'chooseLang.js',
                    help: 'Select the language Felix should answer with, this will override the set language of the server you\'re in'
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(message.channel.createMessage(":x: You should specify something for me to do"));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Account();