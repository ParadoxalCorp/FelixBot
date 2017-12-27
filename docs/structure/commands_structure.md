## Commands structure

* Use this as reference if you want to add a command in your forked version or to pull request one, its mainly to keep reference of how the structure changes in each update

* Commands are classes in Felix to be fancy but they can be basic objects, it won't change anything

* Optional parameters will be marked with a `*`

#### help object

The help object is needed for commands to be registered and referenced in the help, this object can have the following properties:

`help.name` {String} The name of the command, this must be the same as the file name

`help.category*` {String} The category of the command, if not specified, will be set to the folder name in which the command is 

`help.usage` {String} A quick explanation of how to use the command, note that the prefix will be put before it, so `help.usage = ping` will become `f!ping` for example (in the case the prefix is `f!`)

`help.description` {String} A quick description of what the command does *shrug*

`help.detailedUsage*` {String} A long description about how to use the command, every instance of `{prefix}` will be replaced with the prefix when the help gets triggered

`help.parameters*` {String} [Deprecated] 

#### conf object*

The conf object is entirely optional and may contain this command "configuration" like whether the command can be used in DM, is locked to the owner of the bot or the aliases of this command

`conf.aliases*` {Array<{String}>} An array of strings each representing one alias

`conf.guildOnly*` {Boolean} Whether the command can be used in direct messages as well, default is `false`

`conf.disabled*` {Boolean || String} Whether the command is "disabled", if not `false`, this will return the string instead of running the command. Default is `false`

`conf.ownerOnly*` {Boolean} Whether the command is locked to the owner of the bot, default is `false`

`conf.cooldownWeight*` {Number} The "weight" of the command, basically the bigger the command output is, the higher this number should be. Users will be ratelimited if they reach 20, default is 5

#### shortcut object*

May be deprecated in a soon future, the shortcuts to be associated with the command, these will be run instead of the command if the trigger is detected by the command handler 

`shortcut.triggers` {Map} A map of shortcuts mapped by their trigger, the value associated to the trigger must be an object containing the `script` and `help` property, here's an example of the structure of the `shortcut` object

```js
{ 
    triggers: new Map([
        ['enable_greetings', {
            script: 'enableGreetings.js',
            help: 'Enable the greetings'
        }]
    ])
} 
```

The shortcut script has to be in `/util/shortcuts/[command_name]/[shortcut_script]`

#### run async function

The `run` property of the command class/object is a function and the actual script of the command, it should be a promise-returning function since the command handler await it when it calls it before finishing the process. It can be synchronous since its natively handled but i wouldn't recommend it. 

You can also reject an error or anything you want to reject, the rejection will be catched by the command handler and the `error` event will be emitted, from that the `error` event listener will take care of it

The command handler send the three following parameters when calling the run function of the command:

`client` The client instance, or bot, from which you can access all of the bot related data, like the database, the guilds... (head over to [eris](https://abal.moe/Eris/docs/Client) docs to see what you can do with it and to Felix client structure docs(located in the overall structure docs))

`message` The message object which triggered this command

`args` The message content splitted by spaces into an array with the first element removed(prefix + command or mention), so for example if the message sent is "f!ping curiously i want to eat a baguette", `args` will be:
 
 ```js

 ["curiously", "i", "want", "to", "eat", "a", "baguette"]

 ```

 So the overall function looks like the following example:

 ```js

 run(client, message, args) {
     return new Promise(async(resolve, reject) => {
         try {
             let baguette = await message.channel.createMessage(`baguette :french_bread:`);
             resolve("baguette");
         } catch (err) {
             reject(err);
         }
     });
 }

```


