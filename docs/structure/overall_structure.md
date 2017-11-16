# Overall Felix structure

This is for curious peoples and for later references, it describe how Felix works and handle each events and some other fancy stuff

### Felix client instance

@extends [Client](https://abal.moe/Eris/docs/Client)

An extended class of the eris client with the following properties:

`Felix.userData` The user database, for all database methods, see [enmap](https://www.npmjs.com/package/enmap)

`Felix.guildData` The guild database, for all database methods, see [enmap](https://www.npmjs.com/package/enmap)

`Felix.backups` A database here specially for backups, by default contains a backup of `config/core-data.json`

`Felix.clientData` To be honest could be in `config/core-data.json` but i decided to make a separated database for it(its stuff like tokens and stuff)

### Launching process

Most of the steps described here are logged in the console when launching, just more details ^ (also its in the order)

##### Eris overwrite

* Why/what does it means "overwrite" ?

If you selfhost or plan to selfhost Felix, and don't know much about it, you might be like "what the heck is eris and why the heck felix overwrites it"

> Eris is the library or API wrapper Felix uses to interact with Discord, to tl;dr it, it basically handle everything that Discord send to Felix and make request to Discord when Felix has to perform an action on Discord

(And if you're an actual dev who got triggered by this explanation, pls dont hurt me)

* Alright but why does Felix overwrite that ?

Basically to make the stuff easier, Eris lacks some useful methods that Felix use on a regular basis, this overwrite basically add these methods

(If its the first time, Felix will most likely need a restart for the overwrite to take effect)

In the update `2.5.0`, this "extended library" concept was already here, but it was using a copy of the library instead of the original one, which made library updates kinda hard since it could break everything.

However this overwrite just change what's needed within the original, so if a library update is out, all other components than the overwritten ones can be updated automatically

##### Database loading

Synchronously with the overwrite, the database is being loaded, once that is done, the database auto-update is launched. This can take over 10 seconds if the database is very big but usually takes less

* Database auto-update ?

Basically a process which updates all users and guilds database entry automatically to the most recent format while preserving the said users and guilds data

##### Commands loading

At this step Felix load and register commands

##### Events loading
 
And there Felix loads the event listeners or put simpler the scripts to be executed when something happen like when a new member join a server or when a message is posted

[The remaining stuff soon, im sleepy atm]
