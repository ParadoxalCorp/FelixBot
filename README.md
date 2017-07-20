# FelixBot
Felix is here, was first supposed to be a meme but hey, its a thing now ! 
About Felix's source usage, note that Felix is under APACHE 2.0 license, more informations at the very bottom of this readme.
# Tables of contents
* [Features](https://github.com/ParadoxOrigins/FelixBot/blob/beta/README.md#features)
* [Commands](https://github.com/ParadoxOrigins/FelixBot/blob/beta/README.md#commands)
* [Invite link and support server](https://github.com/ParadoxOrigins/FelixBot/blob/beta/README.md#invite-link-and-support-server)
* [Questions/Answers](https://github.com/ParadoxOrigins/FelixBot/blob/beta/README.md#quick-questionsanswers)
* [Felix's open source usage infos](https://github.com/ParadoxOrigins/FelixBot/blob/beta/README.md#felixs-open-source-usage)
* [Installation](https://github.com/ParadoxOrigins/FelixBot/blob/beta/README.md#installation-requirements)
## Features
* Simple but powerful permission system
* Custom prefix
* Some fun commands and utility commands
* Active development (what? its not a feature? kek)
* Aliases for commands, ofc
* Server management features
* A lot of stuff planned
### Commands
![Alt text](https://cdn.discordapp.com/attachments/274638306438938635/337541435991523339/unknown.png)
### Invite link and support server
[invite link](https://discordapp.com/oauth2/authorize?&client_id=327144735359762432&scope=bot&permissions=2146950271)

[Support server](https://discord.gg/Ud49hQJ)
### Quick Questions/Answers
* Will Felix have a music feature?
> There is already a bunch of great bots with great music feature (Rem, Hifumi, Ayana...) so i dont see the point of adding it
* How does the permissions system work?
----
Before diving into how it works, here's some rules that you should know:

-Administrator are level 2 by default, as long as they have Administrator permissions, their level cant be decreased

-Users are level 1 by default as long as you dont set any level for them

-If a user has two roles with 2 differents levels, this user level will be the one of the highest role

-No matter what, users will always be able to use the help command
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

* Can i request a feature?
> Yeah, as long as its not a music feature :^)

* Where can i request a feature?
> You can use the #feature-request channel on the support server or open an issue on the github(aka here)

* I found a bug, where can i report it?
> You can use the #bugs-report channel on the support server or open an issue on the github(aka here)

* Where can i see the planned stuff?
> Here, planned things are in the issues panel

* Does Felix need the Administrator permission?
> You can give Felix as much permissions as you want, but if you want Felix to work perfectly, the best choice is to give him Administrator permissions

## Felix's open source usage:
You can freely use a small part of the code for private/public use, however, if you use the whole code, even with some modifications, you must give credits.

* Can i download the source, run it myself, change the bot name and the bot pfp then claim it as my bot?
> No.

* Can i download the bot and selfhost it only on my server?
> You can, but no official support is provided, for any questions you can still ask on the support server, i may help you

* Can i use the whole Felix's code, but adding some new commands and stuff, and upload it to Carbonitrex or whatever discord bots website list?
> Yes, but it has to be like: Made by [insert Felix's devs names here] and edited by [insert your name here]

* Can i fork the repository and make pull request for stuff that i would like to see on Felix?
> Yay ! But be aware, it might not get accepted, so you should suggest it first
## Installation requirements
* Node.js 8 or higher
* a mashape api key
* a rapidapi api key
* Wolke's image api key (if Wolke is kind enough to give you one, if not, or if you dont know who i am talking about, dm me)
* A basic understanding of node js, for more infos about Felix's api and how Felix works, use the support server
