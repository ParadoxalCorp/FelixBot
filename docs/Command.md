<a name="Command"></a>

## Command
**Kind**: global class

* [Command](#Command)
    * [new Command()](#new_Command_new)
    * [.parseCommand(message, client)](#Command+parseCommand) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.hasPermissions(message, client, permissions, [channel])](#Command+hasPermissions) ⇒ <code>boolean</code> \| <code>array</code>
    * [.hasChannelOverwrite(channel, member, permission)](#Command+hasChannelOverwrite) ⇒ <code>boolean</code> \| <code>PermissionOverwrite</code>

<a name="new_Command_new"></a>

### new Command()
Provide some utility methods to parse the args of a message, check the required permissions...

<a name="Command+parseCommand"></a>

### command.parseCommand(message, client) ⇒ <code>Promise.&lt;object&gt;</code>
As it calls the database to check for a custom prefix, the method is asynchronous and may be awaited

**Kind**: instance method of [<code>Command</code>](#Command)
**Returns**: <code>Promise.&lt;object&gt;</code> - - The command object, or undefined if the message is not prefixed or the command does not exist

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | The message object to parse the command from |
| client | <code>object</code> | The client instance |

<a name="Command+hasPermissions"></a>

### command.hasPermissions(message, client, permissions, [channel]) ⇒ <code>boolean</code> \| <code>array</code>
This is a deep check and the channels wide permissions will be checked too

**Kind**: instance method of [<code>Command</code>](#Command)
**Returns**: <code>boolean</code> \| <code>array</code> - - An array of permissions the bot miss, or true if the bot has all the permissions needed, sendMessages permission is also returned if missing

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>object</code> |  | The message that triggered the command |
| client | <code>object</code> |  | The client instance |
| permissions | <code>array</code> |  | An array of permissions to check for |
| [channel] | <code>object</code> | <code>message.channel</code> | Optional, a specific channel to check perms for (to check if the bot can connect to a VC for example) |

<a name="Command+hasChannelOverwrite"></a>

### command.hasChannelOverwrite(channel, member, permission) ⇒ <code>boolean</code> \| <code>PermissionOverwrite</code>
It takes into account the roles of the member, their position and the member itself to return the overwrite which actually is effective

**Kind**: instance method of [<code>Command</code>](#Command)
**Returns**: <code>boolean</code> \| <code>PermissionOverwrite</code> - - The permission overwrite overwriting the specified permission, or false if none exist

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>object</code> | The channel to check permissions overwrites in |
| member | <code>object</code> | The member object to check permissions overwrites for |
| permission | <code>string</code> | The permission to search channel overwrites for |