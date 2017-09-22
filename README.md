<h1 align="center"> FelixBot </h1>
  <p align="center">
    <a href="https://david-dm.org/ParadoxOrigins/FelixBot" target="_blank"><img src="https://david-dm.org/ParadoxOrigins/FelixBot/status.svg" alt="Dependencies"></a>
    <a href="https://github.com/ParadoxOrigins/FelixBot/blob/master" target="_blank"><img src="https://img.shields.io/github/stars/ParadoxOrigins/FelixBot.svg?style=social&label=Star" alt="Github Stars"></a>
    <a href="https://github.com/ParadoxOrigins/FelixBot/issues" target="_blank"><img src="https://img.shields.io/github/issues/ParadoxOrigins/FelixBot.svg" alt="Github Issues"></a>
  </p>

Felix is here, was first supposed to be a meme but hey, its a thing now ! 
About Felix's source usage, note that Felix is under APACHE 2.0 license, more informations at the very bottom of this readme.
# Tables of contents
* [Features](https://github.com/ParadoxOrigins/FelixBot/blob/master/README.md#features)
* [Commands](https://github.com/ParadoxOrigins/FelixBot/wiki/Generic)
* [Invite link and support server](https://github.com/ParadoxOrigins/FelixBot/blob/master/README.md#invite-link-and-support-server)
* [Planned stuff](https://github.com/ParadoxOrigins/FelixBot/blob/master/README.md#planned-stuff)
* [Permissions system](https://github.com/ParadoxOrigins/FelixBot/blob/master/README.md#level-system)
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
### Level system
* How does the permissions system work?
----
Before diving into how it works, here's some rules that you should know:

-Administrator are level 2 by default, as long as they have Administrator permissions, their level cant be decreased

-Users are level 1 by default as long as you dont set any level for them

-If a user has two roles with 2 differents levels, this user level will be the one of the highest role

#### The levels
* Level 0: The user cant use any commands besides help
* Level 1: The user can use every commands besides moderation and settings one
* Level 2: The user can use every commands
#### Usage
There are 3 arguments: -c, -r and -u
-c means channel, -r means role and -u means user
Here's an example how to use it:

> f!setLevel 2 -r Moderators

This command gives the level 2 to the role Moderators
If you dont add any arguments to the command like this:

> f!setLevel 0

The level will be assigned to the whole server, which mean for example that this command disable all commands for everyone(excepted for Administrators ofc)
#### Advanced usage
Levels have a strength order, this order from the strongest to the weakest is: User > Role > Channel > Server

What does it mean? 
It mean for example that you can do that:
> f!setLevel 0

then

> f!setLevel 1 -c botcommands

This will disable every commands for everyone in the whole server excepted in the #botcommands channel

Got it? Great, lets get back to the questions !

----

