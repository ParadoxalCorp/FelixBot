class Account {
    constructor() {
        this.help = {
            name: 'account',
            usage: 'account',
            description: 'Enter your account settings, where you can reset your data or change some of your data privacy (only stuff related to Felix ofc)'
        }
        this.shortcut = {
            triggers: new Map([
                ['upvote_privacy', {
                    script: 'setUpvotePrivacy.js',
                    args: 1,
                    help: 'Set your upvote privacy(if you upvoted, whether or not you will appear on Felix\'s status), valid privacies are `Public` and `Private`'
                }],
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
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                resolve(message.channel.createMessage("Heads up ! Since update `3.0.0` this command uses the website, but you can still use the shortcuts if you don't want to use the website ^"));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Account();