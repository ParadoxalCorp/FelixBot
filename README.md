<h1 align="center"> FelixBot </h1>
  <p align="center">
    <a href="https://david-dm.org/ParadoxalCorp/FelixBot" target="_blank"><img src="https://david-dm.org/ParadoxalCorp/FelixBot/status.svg" alt="Dependencies"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/blob/master" target="_blank"><img src="https://img.shields.io/github/stars/ParadoxalCorp/FelixBot.svg?style=social&label=Star" alt="Github Stars"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/issues" target="_blank"><img src="https://img.shields.io/github/issues/ParadoxalCorp/FelixBot.svg" alt="Github Issues"></a>
  </p>

Felix is here, was first supposed to be a meme but hey, its a thing now ! 
About Felix's source usage, note that Felix is under APACHE 2.0 license
# Tables of contents
* [Features](https://github.com/ParadoxalCorp/FelixBot/blob/master/README.md#features)
* [Commands](https://github.com/ParadoxalCorp/FelixBot/wiki/Generic)
* [Invite link and support server](https://github.com/ParadoxalCorp/FelixBot/blob/master/README.md#invite-link-and-support-server)
* [Permissions system](https://github.com/ParadoxalCorp/FelixBot/blob/master/README.md#permissions-system)
* [FAQ](https://github.com/ParadoxalCorp/FelixBot/wiki/FAQ)
* [Installation](https://github.com/ParadoxalCorp/FelixBot/wiki/Linux)
* [Contributing](https://github.com/ParadoxalCorp/FelixBot/blob/master/README.md#contributing)

## Features
* Simple but powerful permission system
* Custom prefix
* Some fun commands and utility commands
* Active development (what? its not a feature? kek)
* Aliases for commands, ofc
* Server management features
* Moderation features (modlog, hackban, mute, ban...)
* Starboard 
* Custom greetings/farewell
* auto-assignables roles
* A lot of stuff planned
### Invite link and support server
[invite link](https://discordapp.com/oauth2/authorize?&client_id=327144735359762432&scope=bot&permissions=2146950271)

[Support server](https://discord.gg/Ud49hQJ)

## Self-hosting v3

The only required fields in the config.js file are the `ownerID`(well probably the `admins` one as well) and the `token` fields, features will automatically be disabled if the needed api keys are missing

There is some customizable options in the config file like the cooldowns, but market items are in the core-data.json file

### First run notice
The first time you run Felix(and everytime you will run him), Felix overwrites some of Eris(the API wrapper Felix uses) files, once the overwrite is done (status is logged to the console) you'll have to stop Felix and restart him for the right files to get loaded

### What happen to users data?
Im that kind of guy who likes to know what exactly happen to my data when a application or something collect it, so even if probably very few users cares about how a bot use their data, here's what we exactly store and do with it:

#### Yes, what do you store about me?
Basically, only your Discord user ID, that allow us to efficiently store and differenciate users, all of the other data we store "about you" are Felix-related(Your points, experience, market items you bought...) 

#### And, is that all?
Well yes `¯\_(ツ)_/¯`

#### Alright but when do you store users? Who are "users" and how can i stop be a "user"?
A new entry in the database is created when you first use a command, which means you won't be considered as a "user" and therefore won't be in the database as long as you don't use Felix.

You can always reset your data with the `account` command and join the support server to request a full deletion of your data(but you will still be stored again once you use a command)

### Credits

**Side note:** As Discord introduced their discriminator changer for nitro scrubs, there is no more human-readable way to identify a user, so discriminators below may be outdated, so here's the IDs of them now.

* `Aetheryx#2222` (284122164582416385) Original author of the `logger` module, also helped to shorten quite a few parts of the code
* `Wolke#0001` (128392910574977024) For his awesome Rem bot on which Felix is inspired and for his and `TheAkio#0001`'s (108638204629925888) awesome image API
* `FrostyRaiden#7802` (143445435477000192) Helped me locate most of the v3 bugs during the beta, and if you ever feel like thanking someone for Felix's pretty easy self-hosting, thanks him ^
* `Karen#6969` (162325985079984129) The best for the end, basically Felix wouldn't even be alive without him ^

### Contributing

Any kind of contribution is appreciated, to get started you should take a look at the `/docs` folder and join the support server for any question

Also, as your PR (Pull Request) may not be accepted, to avoid working for nothing you should ask (on the support server) if the feature you want to be added can be added
