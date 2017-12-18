<h1 align="center"> FelixBot </h1>
  <p align="center">
    <a href="https://david-dm.org/ParadoxalCorp/FelixBot" target="_blank"><img src="https://david-dm.org/ParadoxalCorp/FelixBot/status.svg" alt="Dependencies"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/blob/master" target="_blank"><img src="https://img.shields.io/github/stars/ParadoxalCorp/FelixBot.svg?style=social&label=Star" alt="Github Stars"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/issues" target="_blank"><img src="https://img.shields.io/github/issues/ParadoxalCorp/FelixBot.svg" alt="Github Issues"></a>
  </p>
  <p align="center">
  <a href="https://discordbots.org/bot/327144735359762432?utm_source=widget">
  <img src="https://discordbots.org/api/widget/327144735359762432.svg" alt="Discord Bots" />
</a>
</p>

Felix is here, was first supposed to be a meme but hey, its a thing now ! 
About Felix's source usage, note that Felix is under APACHE 2.0 license, more informations at the very bottom of this readme.
# Tables of contents
* [Features](https://github.com/ParadoxOrigins/FelixBot/blob/master/README.md#features)
* [Commands](https://github.com/ParadoxOrigins/FelixBot/wiki/Generic)
* [Invite link and support server](https://github.com/ParadoxOrigins/FelixBot/blob/master/README.md#invite-link-and-support-server)
* [Permissions system](https://github.com/ParadoxalCorp/FelixBot/blob/master/README.md#permissions-system)
* [FAQ](https://github.com/ParadoxOrigins/FelixBot/wiki/FAQ)
* [Installation](https://github.com/ParadoxOrigins/FelixBot/wiki/Linux)
## Features
* Simple but powerful permission system
* Custom prefix
* Some fun commands and utility commands
* Active development (what? its not a feature? kek)
* Aliases for commands, ofc
* Server management features
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

