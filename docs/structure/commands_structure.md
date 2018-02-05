## Commands structure

* Use this as reference if you want to add a command in your clone version or to pull request one, its mainly to keep reference of how the structure changes in each update

* Commands are classes in Felix to be fancy but they can be basic objects, it won't change anything

* Optional parameters will be marked with a `*`

#### help object

The help object is needed for commands to be registered and referenced in the help, this object can have the following properties:

  | Property | Data Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the command, this must be the same as the file name |
| category* | <code>String</code> | The category of the command, if not specified, will be set to the folder name in which the command is  |
| usage | <code>String</code> | A quick explanation of how to use the command, note that the prefix will be put before it, so `help.usage = ping` will become `f!ping` for example (in the case the prefix is `f!`) |
| description | <code>String</code> | A quick description of what the command does *shrug* |
| detailedUsage* | <code>String</code> | A long description about how to use the command, every instance of `{prefix}` will be replaced with the prefix when the help gets triggered |

#### conf object*

The conf object is entirely optional and may contain the command "configuration" like whether the command can be used in DM, is locked to the owner of the bot or the aliases of this command

  | Property | Data Type | Description |
| --- | --- | --- |
| aliases | <code>Array</code> | An array of strings, each string being an alias of the command |
| guildOnly | <code>Boolean</code> | Whether or not this command can only be used in guilds and not in dm, default is `false` |
| disabled | <code>Boolean OR String</code> | Whether the command is "disabled", if not `false`, this will return the set string when running the command. Default is `false` |
| ownerOnly | <code>Boolean</code> | Whether the command is locked to the owner set in the config file, default is `false` |
| cooldownWeight | <code>Number</code> | The "weight" of the command, basically the bigger the command output is, the higher this number should be. Users will be ratelimited if they reach 20, default is 5 |
| require | <code>Array</code> | An array of property names of the `client.config` object, used to tell to Felix that the command requires for example an API key in the config. Felix will automatically disable the command if the said API key is missing. |
| requirePerms | <code>Array</code> | An array of permissions (like `manageMessages`) that Felix needs to run the command, if specified and Felix hasn't the required permissions, the command handler will abort before launching the command and return an error message to the user. |
| donatorOnly | <code>Boolean</code> | Whether or not the command should be locked to donators, this does not work in self-host cases |

#### shortcut object*

May be deprecated in a soon future, the shortcuts to be associated with the command, these will be run instead of the command if the trigger is detected by the command handler 

  | Property | Data Type | Description |
| --- | --- | --- |
| triggers | <code>Map</code> | A map of shortcuts mapped by their trigger, the value associated to the trigger must be an object containing the `script` and `help` properties |

Here's an example of the structure of the `shortcut` object

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


