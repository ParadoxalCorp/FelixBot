<h1 align="center"> FelixBot </h1>
  <p align="center">
    <a href="https://david-dm.org/ParadoxalCorp/FelixBot" target="_blank"><img src="https://david-dm.org/ParadoxalCorp/FelixBot/status.svg" alt="Dependencies"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/blob/master" target="_blank"><img src="https://img.shields.io/github/stars/ParadoxalCorp/FelixBot.svg?style=social&label=Star" alt="Github Stars"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/issues" target="_blank"><img src="https://img.shields.io/github/issues/ParadoxalCorp/FelixBot.svg" alt="Github Issues"></a>
  </p>

Felix is here, was first supposed to be a meme but hey, its a thing now ! 
About Felix's source usage, note that Felix is under APACHE 2.0 license, more informations on the wiki.
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
* Custom tags
* auto-assignables roles
* A lot of stuff planned
### Invite link and support server
[invite link](https://discordapp.com/oauth2/authorize?&client_id=327144735359762432&scope=bot&permissions=2146950271)

[Support server](https://discord.gg/Ud49hQJ)

### What happen to users data?
Im that kind of guy who likes to know what exactly happen to my data when a application or something collect it, so even if probably very few users cares about how a bot use their data, here's what we exactly store and do with it:

#### Yes, what do you store about me?
Basically, only your Discord user ID, that allow us to efficiently store and differenciate users, all of the other data we store "about you" are Felix-related(Your points, experience, market items you bought...) 

#### And, is that all?
Well yes but no, we(well only me use these data) log guilds(servers) joined and left, however since 2.5.0, as pointed out by someone, we do not log guild names and guild owners anymore. We only log: The members count, the bots count and the guild ID in case we need to retrieve the guild someday, these are for statistics purposes and aren't stored anywhere in our database, only in a Discord channel. 

#### Alright but when do you store users? Who are "users" and how can i stop be a "user"?
A new entry in the database is created when you first use a command, which means you won't be considered as a "user" and therefore won't be in the database as long as you don't use Felix.

However, there is a special case, in which in order to prevent crash Felix create a database entry when a user specify you in a command. You can always reset your data with the `account` command and join the support server to request a full deletion of your data(but you will still be stored again once you use a command)

### Credits
* `Aetheryx#2222` Original author of the `logger` module, also helped to shorten quite a few parts of the code
* `Wolke#5985` For his awesome Rem bot on which Felix is inspired
* `Karen#3938` The better for the end, basically Felix wouldn't even be alive without him ^
