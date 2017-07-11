# FelixBot
Felix is here, was first supposed to be a meme but hey, its a thing now ! 
About Felix's source usage, note that Felix is under APACHE 2.0 license, more informations at the very bottom of this readme.
## Features
* Simple but powerful permission system
* Custom prefix
* Some fun commands and utility commands
* Active development (what? its not a feature? kek)
* Aliases for commands, ofc
* A lot of stuff planned
### General/Utility commands
There is no description atm sorry (note, commands are not case-sensitive, but the prefix is ofc ^^)
* ping
* mdn
* npm
* uinfo
* stats
* sinfo
* cardsearch (search hearthstone cards and return the stats)
* malsearch (search for animes, mangas and users on MyAnimeList)
### Fun commands
* hug
* kiss
* pat
* slap
* love
* facepalm
* cry
* urdef (basically urban dictionary definitions)
### Moderation commands
* setlevel
* getlevel
### Settings commands
* updatechan
* onjoinrole
* setprefix
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
You can freely use a small part of the code for private use, however, if you use the whole code, even with some modifications, you must give credits.

* Can i download the source, run it myself, chane the bot name and the bot pfp then claim it as my bot?
> No.

* Can i download the bot and selfhost it only on my server?
> You can, but no official support is provided, for any questions you can still ask on the support server, i may help you

* Can i use the whole Felix's code, but adding some new commands and stuff, and upload it to Carbonitrex or whatever discord bots website list?
> Yes, but it has to be like: Made by [insert Felix's devs names here] and edited by [insert your name here]

* Can i fork the repository and make pull request for stuff that i would like to add on Felix?
> Yay ! But be aware, it might not get accepted, so you should suggest it first
