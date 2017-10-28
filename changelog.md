
# Update 2.5.0 Changelog
## New stuff
* Added `choose`, now you can choose between coffee and tea when waking up (Actually don't do that, always take coffee :^))
* Added multi-commands, what it meansis that you can now run up to 3 commands at once using `&&`
* Commands now also works with mentions instead of prefix
* Shortcuts: Felix is designed to be usable and understandable the very first time, that's why advanced commands use reactions rather than a complex setup of parameter, however you can quickly be annoyed by that since its pretty slower. That's why there is now shortcuts for these commands, you can see them in the help of each commands

## Improvements
* All resolver modules (userResolver, roleResoler..) now ask for user confirmation if mutliple users/channels.. have the same name/username. Also, User matching by partial username/nickname now match only if the match is over 30%, so it won't resolve `Hey i love baguettes#0000` when you put `love` anymore
* Files gives you experience too now

## Backend breaking changes
* To read carefully for selfhost case: Now doesn't use the original d.js module but a enhanced version for felix so no need to install d.js anymore
* `client.awaitReply()`, `client.getUserResolvable()`, `client.getRoleResolvable()`, `client.getGuildResolvable()` and `client.getChannelResolvable()` aren't methods of the `Client` anymore but directly of `Message` (refer to the enhanced d.js(paradoxal-d.js) docs)
* The `Member` class now has the `username`, `tag` and `discriminator` property as well, so you don't need to the `User` class for that anymore 

# Update 2.3.0 Changelog
## New stuff/Improvements
* Added `rps`, basic game but another way to win some points ^
* You can now use partial types name in the `image` command

## Fixes (tbh, this update is kinda just a big fix)
* Fixed a lot of grammar
* Fixed negative values possible in games as well as in transfer which was giving you the possibility to litterally get endless points
* Fixed greetings and farewell error catch which means now the `Status` thing is finally working

# Update 2.2.0 Changelog
## Improvements
* `slots` now is a bit kinder when you lose, there is less chances to lose more than what you gambled
* `t`is now a command, still only run tags, but now has a help, i guess *shrug*
* Now if you edit your last message to a command, like if you made a typo, it will work owo

## Fixes
* Fixed `animeseason` not updating the list directly after a new search
* Fixed some grammar

## Backend breaking changes
* Moved `malsearch.js` to the new `modules` folder inside the `modules` folder *modulesception*
* Deleted `tagHandler.js` since the `t` command replace it
* Added `logger.js` by `Aetheryx#2222` to the custom modules
* Improved `getUserResolvable.js`, search is now smarter, however, global search still shouldn't be used atm
* Removed logs to the console in `loadReminders.js` and `updateDatabase.js`
* Added the event `messageUpdate.js` which emit a new message event if the edited message is the latest of the user
* Added draft logs to the `ready.js` event
* Added a custom modules loader and draft logs in the core

# Update 2.1.0 Changelog
## New commands/improvements
* Added `transfer`
* Added back `urban`, `animeseason`, `npm`, `mdn` and `invite`

## Bugs fixes
* Fixed the pageResults() module and all its dependents
* Fixed love not working correctly when using an id as user resolvable

# Update 2.0.2 Changelog

## New commands
* `mdn` Updated to the 2.0 structure, works like the old one.
* `npm` Updated to the 2.0 structure, works like the old one.

## Bugs fixed
* Fixed commands not working in direct messages

# Update 2.0 Changelog

This changelog contains all changes, including the backend stuff for later references, 
The actual notable parts are the [commands](https://github.com/ParadoxOrigins/FelixBot/blob/master/changelog.md#commandes-changes) and [bugs fixes](https://github.com/ParadoxalCorp/FelixBot/blob/master/changelog.md#bugs-fixes)

`v2 panel system` refer to interactive commands working with reactions

Things marked with ** are planned to change before the official release or soon after

Things marked with *** might change before the official release or soon after

## Commands changes

### Generic commands
* `help` Shortened `miscellaneous` to `misc`, also updates every trigger again
* `uinfo` Removed data which were available by clicking on the user profile, also filter according to users privacy settings
* `bot` New optional upvoters fields, memory usage calcul fixed
* `afk` A small change in how to use it and now allows you to set your afk status to 'nothing'
* `account` Now uses v2 panel system and has more options regarding data privacy
* `changelog` Nothing really changed

### Images commands
* `awoo` Output is now in an embed
* `cry` Output is now an embed and limited to gifs
* `cuddle` Output is now an embed and limited to gifs, doesn't need mentions to find users anymore
* `hug` Output is now an embed and limited to gifs, doesn't need mentions to find users anymore
* `kiss` Output is now an embed and limited to gifs, doesn't need mentions to find users anymore
* `slap` Output is now an embed and limited to gifs, doesn't need mentions to find users anymore
* `image` Performances improvement, is now faster
* `karen` Nothing changed
* `punch` New command, doesn't need mentions to find users, is not working with weeb.sh

### Misc commands
* `iam` Now uses v2 panel system for the list ***
* `iamnot` Now uses v2 panel system for the list ***
* `leaderboard` Now uses the v2 panel system and now has a global/local leaderboard of points and love as well
* `tags` Now uses v2 panel system, is the former `edittag`, `addtag` and `deletetag` commands all-in-one
* `tagslist` Now uses v2 panel system, is the former `tagslit` and `taginfo` commands all-in-one
* `market` New command, uses v2 panel system, you can buy stuff like additional love points here

### Utility commands
* `anime` Some improvements regarding speed, fields are now dynamics which means if there is no data, the field wont be displayed anymore
* `manga` Some improvements regarding speed, fields are now dynamics which means if there is no data, the field wont be displayed anymore

### Settings commands
* `setgreetings` Now uses v2 panel system, support 2 more flags, fixes a few bugs
* `setfarewell` Same than `setgreetings`
* `setprefix` Now has a 8 characters limit and doesnt accept multiple words anymore
* `selfrole` Formerly `autorole`, now uses the v2 panel system
* `onjoinrole` Now allow up to 5 roles and uses the v2 panel system
* `experience` Formerly `levelsystem`, now uses the v2 panel system

### Fun commands
* `love` Doesn't need mentions anymore, can love multiple users and give multiple LPs to one user
* `slots` New command, currently the only game where you can win credits
* `daily` New commands, gives you 500 points every 24h that you can gamble with `slots` or use in the market

### Moderation commands
* `getlevel` Now uses the v2 panel system for the whole list and user search is not-anymore limited to mentions
* `removelevel` User search is not anymore limited to mentions
* `setlevel` User search is not anymore limited to mentions
* `clear` New command, currently has the two combinable bots and specified users filter
* `settings` New command which use the v2 panel system to manage some of the felix-related server settings(mostly data privacy)
* `announce` Now has a mention option

### Admin commands
* `eval` Output is now an embed and contains both input and output in JS codeblocks
* `maintenance` New command, set Felix's status to dnd and ignore all users besides the owner
* `blacklist` Can now blacklist and unblacklist multiple users, also, doesnt need only the id anymore
* `reload` Reload commands and can 'add' commands to the commands collection as well, still need the exact name
* `runinfo` New command with way more detailled data than `bot`
* `guildsettings` New command, a easier way to fix guilds which fucked up with the settings, shouldn't be needed with the new fixes tho
* `postupdate` Nothing really changed
* `setversion` Nothing really changed
* `cmdstats` New command, display overall commands categories usage and commands usage

### Commands not yet rewritten
* `trivia`
* `animeseason`
* `invite`
* `mdn`
* `npm`
* `urban`

### Removed commands
Commands marked with * might be added back later
* `cardsearch` 
* `feedback` 
* `maluser` *
* `animelist` *
* `remind` *

## Bugs fixes 
* @Felix prefix or @Felix help doesn't work if Felix has a nickname
> Fixed
* Setting the prefix to `beep beep` or any multi-words stuff breaks Felix
> Fixed
* Setting the dm greetings with a relatively long message doesn't work
> Fixed
* Felix happen to not answer to some commands but still answer to ping
> Usually happen because the output exceed the Discord characters limit, should be fixed, also output 'An error occured' now

## Structure changes
Now diving into backend stuff, and there's a lot, a real lot of things that changed

### Events
* `message` Has been splitted into 5 parts: The `message` event which basically handle the first checks, like if the user is in the database,
and the 4 `expHandler`, `commandHandler`, `tagHandler` and `permissionsChecker` handlers
* `ready` Has now a way more important role, it launch the various external services (discord bot list, weeb.sh) updates interval if not self-hosted
and change the game status every 60 seconds with a random upvoter
* `guildCreate` and `guildDelete` now have a lighter role, if not selfhosted, they both send a notification to the support server and request a discord bot list server count update
* `guildMemberAdd` and `guildMemberRemove` both got updated to the new features
* `commandFail` New custom event, emitted whenever a command fail, try to send 'An error occured' as a reply, log the error and send it to sentry

### Modules
New modules, promisified stuff, the followings are more docs than actual changelogs, but its up to date
Note: In each example, the `client` parameter is not in but still needed, usually provided on bot launch when the requirement is done

Second note: Messages related modules might extends the message object in future releases, but currently, all modules are properties of the `client` object

* `findReminder(userId, reminderId)` *** May be deleted due to the unsure future of the reminder feature
> Meant to avoid the database caching

Returns: {Number} - The reminder's array position

Call example: 

```js
client.findReminder('242408724923154435', 944552565);
```

Response structure:

```js
0
```

* `loadReminders()` *** May be deleted due to the unsure future of the reminder feature
> Made to load reminders after a restart

Returns: {Object} - An object containing the restarted and deleted reminders count

Call example:

```js
client.loadReminders();
```

Response structure: 

```js
{
  remindersRestarted: 0,
  remindersDeleted: 0
}
```

* `getPermissionsLevel(guildId, id)` ** Will be improved in further updates, but no outputs or call change planned
> Made to reduce the needed code to check a thing permission level

Returns: {Number} - The level of the thing

Call example: 

```js
client.getPermissionsLevel('328842643746324481', '140149699486154753');
```

Response structure: 

```js
0
```

* `getUserResolvable(message, options)`  ** Will be improved in further updates
> Powerful function to resolve ids, usernames, case-insenstive names or even partial usernames to users

Returns: {Collection<Id, User>} - A collection of resolved users objects mapped by their ID

Call example:

```js
await client.getUserResolvable(message, {
   guildOnly: true //Optional, default is false
 }
 ```
 
 Response structure:
 
 ```js
 {Collection<Id, User>}
 ```
 
 * `getGuildResolvable(message, options)` ** Options will be added in further updates
 > Same than getUserResolvable
 
 Returns: {Collection<Id, Guild} - A collection of resolved guilds objects mapped by their ID
 
 Call example:

```js
await client.getGuildResolvable(message);
 ```
 
 Response structure:
 
 ```js
 {Collection<Id, Guild>}
 ```

 * `getRoleResolvable(message, options)` 
 > Same than getUserResolvable
 
 Returns: {Collection<Id, Role} - A collection of resolved roles objects mapped by their ID
 
 Call example:

```js
await client.getRoleResolvable(message, {
   charLimit: 5 //Optional, the characters count needed for a word to be included in the search, default is 3,
   shift: true //Optional, whether or not the first word should be removed, default is false
});
 ```
 
 Response structure:
 
 ```js
 {Collection<Id, Role>}
 ```

 * `getChannelResolvable(message, options)` 
 > Same than getUserResolvable
 
 Returns: {Collection<Id, Channel} - A collection of resolved channels objects mapped by their ID
 
 Call example:

```js
await client.getChannelResolvable(message, {
   charLimit: 5 //Optional, the characters count needed for a word to be included in the search, default is 3,
   shift: true //Optional, whether or not the first word should be removed, default is false
});
 ```
 
 Response structure:
 
 ```js
 {Collection<Id, Channel>}
 ```

* `getLevelDetails(level, exp)`

Returns: {Object} - An object containing detailled data regarding the level and exp provided

Call example:

```js
client.getLevelDetails(1, 57);
```

Response structure:

```js
{
  remainingExp: 43,
  requiredExp: 100,
  levelProgress: `57/100`,
  nextLevel: 2,
  percentage: 57% //Deprecated
};
```

* `updateDatabase()`
> Meant to automatically update guilds and users data object from basic changes, support 2 scopes changes

Returns: {Promise<Object>} - An object containing detailled data about the success of the update

Call example:

```js
await client.updateDatabase();
```

Response structure:

```js
{
   usersUpdate: {
      sucess: false,
      error: false
   },
   guildsUpdate: {
     sucess: false,
     error: false
   },
   overallSucess: false
}
```

* `getUserTags(users)` ** [DEPRECATED] Will be removed in further updates, therefore no detailled stuff

* `pageResults(options)` ** Will be unpromisified in further updates
> Meant to create 'pages' of a result list

Returns: {Object} - An object containing the paginated results and the pages count

Call example:

```js
await client.pageResults({
   results: ['firstArrayItem', 'secondArrayItem'],
   size: 20 //Optional, default is 10
});
```

Response structure:

```js
{
  results: [['firstArrayItem', 'secondArrayItem']],
  length: 1
}
```

* `createInteractiveMessage(message, options)` *** 
> Meant to reduce interactive lists to 4-5 lines of code

Returns: {Promise<Object>} - An object containing the reason of the function end and the collected reactions

Call example:

```js
await client.createInteractiveMessage(message, {
  description: `Here's a fancy list of what i ate this morning`,
  content: ['Nothing', 'kappa'],
  limit: 30000 //Optional, default is 60 seconds
}

Response structure:

```js
{
  endReason: 'timeout',
  collected: {Collection}
}
```




