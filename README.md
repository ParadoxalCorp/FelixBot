<h1 align="center"> FelixBot </h1>
  <p align="center">
    <a href="https://david-dm.org/ParadoxalCorp/FelixBot" target="_blank"><img src="https://david-dm.org/ParadoxalCorp/FelixBot/status.svg" alt="Dependencies"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/blob/master" target="_blank"><img src="https://img.shields.io/github/stars/ParadoxalCorp/FelixBot.svg?style=social&label=Star" alt="Github Stars"></a>
    <a href="https://github.com/ParadoxalCorp/FelixBot/issues" target="_blank"><img src="https://img.shields.io/github/issues/ParadoxalCorp/FelixBot.svg" alt="Github Issues"></a>
  </p>
  <p align="center">
  <a href="https://discordbots.org/bot/327144735359762432?utm_source=widget">
  <img src="https://discordbots.org/api/widget/327144735359762432.png" alt="Discord Bots" />
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
* Custom tags
* auto-assignables roles
* A lot of stuff planned
### Invite link and support server
[invite link](https://discordapp.com/oauth2/authorize?&client_id=327144735359762432&scope=bot&permissions=2146950271)

[Support server](https://discord.gg/Ud49hQJ)
# Permissions system
* How does the permissions system work?
----
Before diving into how it works, here's some rules that you should know:

-As long as they have administrator permissions, administrators can use all commands

-All commands are restricted by default, meaning that if you remove the default global permissions, non-administrators won't be able to use any commands

-Channels permissions are stronger than the server permissions, roles perms are stronger than channels perms and users perms are stronger than roles perms

-If a user has two roles with custom permissions, the highest role will be used

-Commands prevail on categories, we'll see the exact meaning of this below

## Setting a new custom permission
> I want a user to be able to use the `announce` command, how do i do this?

`f!setpermission announce true -user [user_resolvable(s)]`

You can specify multiple users as well,  to set a permission for a channel or a role, just use the parameters `-role` and `-channel`

***Note: Don't use any of the three `-user`, `-channel` and `-role` parameter to set the permission for the whole server***
> Well now i don't want that user to be able to use it anymore, how should i do this?

In that case, you have two choices, either set the permission to false (like this):

`f!setpermission announce false -user [user_resolvable(s)]`

Or to remove the permission so the default permissions apply back, thats what we're going to see now
## Removing a permission
So, we just need to use the `removepermission` command, so for example to remove the permission of a user:

`f!removepermission announce -user [user_resolvable(s)]`

Works exactly like `setpermission` but you don't need the `true/false` parameter

## Getting the custom permissions set until now
Of course, we want to know which permissions are set, so we don't get ducked from behind, let's continue with the example we used till now:

`f!getpermissions -user [user_resolvable(s)]`

Again, works like the two other commands but with only the three parameters `-user`, `-role` and `-channel`

## Using commands category
> What if i want to allow user to use a whole category? Do i have to set every commands one by one?

Of course no, you can use the fancy thing `[category]*` instead of the command, so for example to set a permission:

`f!setpermission moderation* true -user [user_resolvable(s)]`

With that, the specified user(s) will be able to use all moderation commands

> Nice ! But what if i want a user to be able to use all moderation commands but not the `clear` command for example?

We said before that commands prevail on categories, so if we follow the precedent example, we can do this:

`f!setpermission clear false -user [user_resolvable(s)]` 

So even while the user has a granted access to the whole `moderation` category, they will not be able to use `clear`

If you have any questions, feel free to ask on the support server ^

----

## Self-hosting v3
(Currently not much to selfhost tho)

The only required fields in the config.json file are the `ownerID` and the `token` fields, features will automatically be disabled if the needed api keys are missing

### First run notice
The first time you run Felix(and everytime you will run him), Felix overwrites some of Eris(the API wrapper Felix uses) files, once the overwrite is done (status is logged to the console) you'll have to stop Felix and restart him for the right files to get loaded

