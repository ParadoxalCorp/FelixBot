# Writing commands

Commands should be in strict mode, or at least, should extend the Command helper module (`root/util/helpers/Command.js`).
While technically it shouldn't be needed, the command could even be a simple object, it is more for consistency across all the commands

For a better view of how a command should look like, check the [example](#example)

## Tables of content
* [help object](#help-object)
- * [help parameters](#help-parameters)
- - * [parameter value](#parameter-value)
* [conf object](#conf-object)
- * [expected arg](#expected-arg)
- - * [possible arg value](#possible-arg-value)
* [extra](#extra)
* [run function](#run-function)
* [examples](#examples)

## help object

This object purpose is for use in the help command, and to retrieve the commands across the structure

| Property | Data Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the command, this must be the same as the file name |
| category | <code>string</code> | The category of the command |
| usage | <code>string</code> | The syntax of the command, note that all instances of `{prefix}` will be replaced by the effective prefix in the help |
| description | <code>string</code> | The description of the command, like usage, instances of `{prefix}` will be replaced by the actual prefix |
| params | <code>object</code> | A [parameters](#help-parameters) object |

### help parameters

This object is somewhat particular, as in, properties names aren't predefined, they should be the name of the parameter, and their value should be either
a simple string describing the parameter, or the following object. For a better view of how it should look like, check the [examples](#examples)

| Property | Data Type | Description |
| --- | --- | --- |
| description | <code>string</code> | The description of the parameter |
| mandatoryValue | <code>boolean</code> | Whether or not a value is mandatory for this parameter |
| values | <code>array<[parameter value](#parameter-value)></code> | An array of [parameter value](#parameter-value) objects |

Note that neither how the parameter and value are parsed matter (you should describe how a value is parsed in the description though), as this object is just for informative use, and will only be used in the help command

#### parameter value

| Property | Data Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the value, or something like `<value>` if the value isn't predefined |
| description | <code>string</code> | Description of what the value means/does |

## conf object

This define most of the command characteristics and will directly impact how the command handler behave with it

| Property | Data Type | Description |
| --- | --- | --- |
| requireDB | <code>boolean</code> | Whether or not the command use the database, if true, the command won't be loaded when the bot is launched without database, and will be dynamically disabled if the connection is lost with the database at some point in the run (and re-enabled once the connection is back) |
| disabled | <code>boolean OR string</code> | Whether the command is disabled, if false, the command is called as expected, otherwise, the value is expected to be a string and the command handler won't run the command. It will instead state to the user that the command is disabled, and print the value as the reason |
| aliases | <code>array[string]</code> | An array of aliases to this command |
| requirePerms | <code>array[string]</code> | An array of permissions (like `manageMessages`) that the bot needs for the command to work perfectly, the command won't be triggered if the bot hasn't one of the permissions in the array |
| guildOnly | <code>boolean</code> | Whether this command can only be used in a guild |
| ownerOnly | <code>boolean</code> | Whether this command can only be used by the owner set in the config file |
| expectedArgs | <code>array<[expected arg](#expected-arg)></code> | An array of arguments the command expect, if you set it, whenever a user trigger the command without arguments, the command handler will query the user for each expected argument |

Note that the `expectedArgs` property is extremely powerful and will affect the arguments with which the run function is called 

### expected arg

| Property | Data Type | Description |
| --- | --- | --- |
| description | <code>string</code> | Description that will be used when querying the user. This is the only mandatory property |
| condition | <code>function</code> | A function that will be called with the three `client`, `message` and `args` parameters, where `client` is the client, `message` the message and `args` an array of arguments that have already been prompted to the user. If the function resolve to `false`, this argument won't be prompted to the user |
| possibleValues | <code>array<[possible arg value](#possible-arg-value)></code> | An array of [possible arg value](#possible-arg-value) objects, which represent the values the command handler should expect |

#### possible arg value

| Property | Data Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the value, it defines what the command handler should expect, if the user input does not match with the name, they will be prompted again. To accept any value, this should be `*` |
| interpretAs | <code>string</code> | This is especially helpful when the syntax of the command isn't how you would humanly prompt a user, this define what exactly will be pushed in the `args` array, note that `{value}` will be replaced by value. If `false`, it won't be pushed into the `args` array |

## extra

This property is entirely optional, it may be of whatever data type, it is just if you want to have other properties for use by the command itself, they should be 
under `<Command>.extra` so they're easily accessible and to be consistent with the other commands which do that

## run function

**This function must be async**

This is the function where the main command code should be, and the one called by the command handler. The command handler will call it with the following arguments:

| Property | Data Type | Description |
| --- | --- | --- |
| client | <code>*</code> | The client class |
| message | <code>*</code> | The eris message |
| args | <code>array[string]</code> | An array of arguments, see [the args parameter](#the-args-parameter) |
| guildEntry | <code>object</code> | This guild database entry, may be undefined unless `conf.requireDB` is true |
| userEntry | <code>object</code> | The user who ran the command database entry, may be undefined unless `conf.requireDB` is true |

### The args parameter

While the `args` parameter are by default directly parsed from the message content, each values of the array are words of the message separated by at least a space
(prefix and command are not included), this is not always the case. If `conf.expectedArgs` is set and a user trigger the command without specifying any argument, the `args` array will no longer simply be the message content parsed. Each argument in the `conf.expectedArgs` will be prompted to the user, and the `args` array 
will be filled with the user replies.

To see this behavior in action, and a full scope of how powerful it can be, you may want to check ou the reload command code (see the second example) and try 
running the reload command without any argument

## Examples

For a very basic command, here's an example: 

```js
'use strict';

const Command = require('../../util/helpers/Command');

class Ping extends Command {
    constructor() {
        super();
        this.help = {
            name: 'ping',
            category: 'generic',
            description: 'pong',
            usage: '{prefix} ping'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
         //...
    }
}

module.exports = new Ping();
```

For a more complicated command that takes full advantage of the command handler and it's possibilities:

```js
'use strict';

const Command = require('../../util/helpers/Command');
const { inspect } = require('util');

class Reload extends Command {
    constructor() {
        super();
        this.help = {
            name: 'reload',
            category: 'admin',
            description: 'Reload a module - This command use a command-line like syntax for its parameters, as in, parameters looks like `--<parameter_name>`. Parameters can have a value, the syntax for specifying a value for a parameter is `--<parameter_name>=<value>`\n\nExample: `{prefix} reload ./module.js --module --bindToClient=moduleBaguette --instantiate`\nThe above example reload the file `module.js` at the root of this command\'s folder, instantiate it without additional parameters and add it as a propriety of the client class under the name `moduleBaguette`',
            usage: '{prefix} reload <file_path> <params>',
            params: {
                '--event': 'Specify that the file you want to reload is an event listener',
                '--command': 'Specify that the file you want to reload is a command, unless the command isn\'t added yet, a path is usually not needed and the command name can be provided instead',
                '--module': 'Specify that the file you want to reload is a module, permit the use of the `--bindToClient` and `--instantiate` parameters',
                '--bindToClient': {
                    description: 'Specify that the file should be added as a property of the client class',
                    mandatoryValue: false,
                    values: [{
                        name: '<name>',
                        description: 'Specify the name under which the file should be added as a property of the client class'
                    }]
                },
                '--instantiate': {
                    description: 'This specify that the command should expect a non-instantiated class that should be instantiated',
                    mandatoryValue: true,
                    values: [{
                        name: 'client',
                        description: 'Specify that the class should be instantiated with the client'
                    }, {
                        name: 'bot',
                        description: 'Specify that the class should be instantiated with the bot instance'
                    }]
                }
            }
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: [{
                description: 'Please specify the path of the file you want to reload/add, or, if a command that is already loaded, the name of the command',
            }, {
                description: 'Please specify the type of the file you want to reload, can be either `event`, `command` or `module`',
                possibleValues: [{
                    name: 'command',
                    interpretAs: '--command'
                }, {
                    name: 'event',
                    interpretAs: '--event'
                }, {
                    name: 'module',
                    interpretAs: '--module'
                }]
            }, {
                //Conditional branch
                description: 'Please specify if a non-instantiated class should be expected from this module, and with what it should be instantiated. Can be either `bot`, `client` or `no` to not instantiate it',
                condition: (client, message, args) => args.includes('--module'),
                possibleValues: [{
                    name: 'bot',
                    interpretAs: '--instantiate=bot',
                }, {
                    name: 'client',
                    interpretAs: '--instantiate=client'
                }, {
                    name: 'no',
                    interpretAs: false
                }]
            }, {
                //Conditional branch
                description: 'Please specify whether the module should be added as a property of the client class, can be either `yes`, `<name>` or `no`. Where `<name>` is the name under which the property should be added, if `yes`, the file name will be used',
                condition: (client, message, args) => args.includes('--module'),
                possibleValues: [{
                    name: 'yes',
                    interpretAs: '--bindtoclient',
                }, {
                    name: '*',
                    interpretAs: '--bindtoclient={value}'
                }, {
                    name: 'no',
                    interpretAs: false
                }]
            }]
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        //...
    }
}

module.exports = new Reload();
```


