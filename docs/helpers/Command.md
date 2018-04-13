<a name="Command"></a>

## Command
**Kind**: global class

* [Command](#Command)
    * [new Command()](#new_Command_new)
    * [.parseCommand(message, client)](#Command+parseCommand) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.clientHasPermissions(message, client, permissions, [channel])](#Command+clientHasPermissions) ⇒ <code>boolean</code> \| <code>array</code>
    * [.hasChannelOverwrite(channel, member, permission)](#Command+hasChannelOverwrite) ⇒ <code>boolean</code> \| <code>PermissionOverwrite</code>
    * [.getUserFromText(options)](#Command+getUserFromText) ⇒ <code>Promise.&lt;User&gt;</code>
    * [.getRoleFromText(options)](#Command+getRoleFromText) ⇒ <code>Promise.&lt;Role&gt;</code>
    * [.memberHasPermissions(member, channel, command, client)](#Command+memberHasPermissions) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.queryMissingArgs(client, message, command)](#Command+queryMissingArgs) ⇒ <code>Promise.&lt;Array&gt;</code>

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

<a name="Command+clientHasPermissions"></a>

### command.clientHasPermissions(message, client, permissions, [channel]) ⇒ <code>boolean</code> \| <code>array</code>
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

<a name="Command+getUserFromText"></a>

### command.getUserFromText(options) ⇒ <code>Promise.&lt;User&gt;</code>
Try to resolve a user with IDs, names, partial usernames or mentions

**Kind**: instance method of [<code>Command</code>](#Command)
**Returns**: <code>Promise.&lt;User&gt;</code> - The resolved role, or false if none could be resolved

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | An object of options |
| options.message | <code>object</code> |  | The message from which to get the roles from |
| options.client | <code>object</code> |  | The client instance |
| [options.text] | <code>string</code> | <code>&quot;message.content&quot;</code> | The text from which roles should be resolved, if none provided, it will use the message content |

<a name="Command+getRoleFromText"></a>

### command.getRoleFromText(options) ⇒ <code>Promise.&lt;Role&gt;</code>
Try to resolve a role with IDs or names

**Kind**: instance method of [<code>Command</code>](#Command)
**Returns**: <code>Promise.&lt;Role&gt;</code> - The resolved role, or false if none could be resolved

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | An object of options |
| options.message | <code>object</code> |  | The message from which to get the roles from |
| options.client | <code>object</code> |  | The client instance |
| [options.text] | <code>string</code> | <code>&quot;message.content&quot;</code> | The text from which roles should be resolved, if none provided, it will use the message content |

<a name="Command+memberHasPermissions"></a>

### command.memberHasPermissions(member, channel, command, client) ⇒ <code>Promise.&lt;boolean&gt;</code>
Check if the given member has the permission tu run the given command

**Kind**: instance method of [<code>Command</code>](#Command)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - A boolean representing whether the member is allowed to use this command

| Param | Type | Description |
| --- | --- | --- |
| member | <code>object</code> | The member to check the permissions for |
| channel | <code>object</code> | The channel in which the command has been used (checks for channel-wide permissions) |
| command | <code>object</code> | The command object from which to check if the member has permissions to use it |
| client | <code>object</code> | The client instance |

<a name="Command+queryMissingArgs"></a>

### command.queryMissingArgs(client, message, command) ⇒ <code>Promise.&lt;Array&gt;</code>
Query to the user the arguments that they forgot to specify

**Kind**: instance method of [<code>Command</code>](#Command)
**Returns**: <code>Promise.&lt;Array&gt;</code> - An array of arguments

| Param | Type | Description |
| --- | --- | --- |
| client | <code>\*</code> | The client instance |
| message | <code>\*</code> | The message that triggered the command |
| command | <code>\*</code> | The command that the user is trying to run |