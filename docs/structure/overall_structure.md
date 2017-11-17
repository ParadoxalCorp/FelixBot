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

##### Core-data backup management

* Probably the less understandable step of the launching process, what is the `core-data` file and why does it needs a backup?

> path: ./config/core-data.json

The `core-data.json` file contains data like the market items and the changelogs, the reason why those are in a JSON file and not in the database is to make it manually editable. In previous versions of Felix, market and changelogs were not even existing, in the live bot they were added on the go and not stored anywhere. 

Storing them in the database would require a script to define and store them at first launch, and another script to edit them (since you can't manually edit it)

* Alright but why a backup?

Basically because JSON files are very unstable, for example, if Felix shutdown while writing in it, the file will basically get wiped out, that's why Felix create a backup and store it in the database, so if the file get someday wiped out, Felix will automatically restore the `core-data.json` file with the backup

##### Server and endpoints launch

> path: ./api/server.js

At this point Felix will launch the server which will initialize all the endpoints, as said in the endpoints docs, the server and the endpoints are a way to interact with Felix from an external service. This is used by Felix's website to fetch users or guilds database entry 

##### config check

> path: ./config/config.json

And the final step in the main script is this one, here Felix checks which API keys are in the config file and disable some features if the API key these features needs is missing. 

For example, if the `wolkeImageKey` API key is missing, Felix will disable most of the image commands since it uses Wolke's `weeb.sh` API for 95% of the image commands

More stuff happen at the launch, here was described only what the main process (`index.js`) was doing, refer to the events processing for more

### Events processing

If you don't know what events are you will be a bit lost here, Discord emit "events" for a lot of stuff so let's do a quick explanation:

For example, when a new member join a server, Discord emit the event `guildMemberAdd`, Felix, to greet the user and other features, listen to this event. What i mean by listen is that there is a specific Felix script which will be run when the event is emitted. You would usually call these scripts "events listeners".

All of the events Felix listen to and their script are located in the `./events` folder

To make another example, when you use a command here's what happen:

=> A message is posted(your command), Discord emit the event `messageCreate` (note: That is handled by the library before being sent to Felix)

=> The `messageCreate` listener script is triggered and from there Felix will process your command

What each event listener do is described in the "On: [Insert_event_name_here]" sections

##### On: messageCreate

> path: ./events/messageCreate.js

The starting point for all commands, this is where the following checks are made:

=> Has the message been posted by a bot ? If yes, Felix will stop here

=> Is the user who posted the message blacklisted ? If yes, Felix will stop here

=> Is the bot in maintenance status and the user not the bot owner ? If yes, Felix  will stop here

=> Does the message contains mentions and does the mentionned users have a afk status set ? If yes, Felix will show their afk message

Once the checks are done, the command handler will be run and if the message has been posted in a guild the experience handler will be run as well

###### Experience handler

> path: ./util/helpers/expHandler.js

This is where, if the guild the message has been set in has the experience system enabled, Felix will calculate how much experience you gained, if you won a level, and if at this level Felix is supposed to give you one or multiple roles

###### Command handler

> path: ./util/helpers/commandHandler.js

The most important part of the command process, here will be parsed the message content to get which command has been requested, and the following checks will be made: 

=> Does the message contains a command ? If not, Felix will stop here

=> Has the message been posted in direct messages ? If yes, Felix will check if the command can be used in dm and stop here if not

=> Is the user who posted the message ratelimited (in cooldown) ? If yes, Felix will stop here

=> Is the command disabled ? If yes, Felix will stop here

When that is done, the permissions checker will be run before continuing.

If the permissions checker returned that the user is not allowed to use the command, Felix will stop here.

Otherwise, arguments will be parsed and Felix will check if the command is actually a shortcut. If yes, Felix will run the shortcut (located at: `./util/shortcuts/[command_name]/[shortcut_name]`) and stop here.

Then Felix will run the command and check if the message contains multiple commands. If yes, Felix will emit a new `messageCreate` event for each so the process is repeated

###### Permissions checker

> path: ./util/helpers/permissionsChecker.js

Well, how the permissions system works is described in the wiki ^
