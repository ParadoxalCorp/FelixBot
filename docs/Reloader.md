<a name="Reloader"></a>

## Reloader
Provides methods to reload events listeners, modules and commands

**Kind**: global class
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| client | <code>\*</code> | The client given in the constructor |


* [Reloader](#Reloader)
    * [new Reloader(client)](#new_Reloader_new)
    * [.reloadCommand(path)](#Reloader+reloadCommand) ⇒ <code>Command</code>
    * [.reloadEventListener(path)](#Reloader+reloadEventListener) ⇒ <code>string</code>
    * [.reloadModule(path, name, options)](#Reloader+reloadModule) ⇒ <code>\*</code>

<a name="new_Reloader_new"></a>

### new Reloader(client)

| Param | Type | Description |
| --- | --- | --- |
| client | <code>\*</code> | The client instance |

<a name="Reloader+reloadCommand"></a>

### reloader.reloadCommand(path) ⇒ <code>Command</code>
Reload the command at the given path, or add it if it wasn't already here

**Kind**: instance method of [<code>Reloader</code>](#Reloader)
**Returns**: <code>Command</code> - The reloaded command so calls can be chained

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The absolute path to the command |

<a name="Reloader+reloadEventListener"></a>

### reloader.reloadEventListener(path) ⇒ <code>string</code>
Reload the event listener at the given path, or add it if it wasn't already here

**Kind**: instance method of [<code>Reloader</code>](#Reloader)
**Returns**: <code>string</code> - The name of the event, parsed from the path

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The absolute path to the event listener |

<a name="Reloader+reloadModule"></a>

### reloader.reloadModule(path, name, options) ⇒ <code>\*</code>
Reload the module at the given path, or add it if it wasn't already here

**Kind**: instance method of [<code>Reloader</code>](#Reloader)
**Returns**: <code>\*</code> - The reloaded module (and instantiated if needed), so calls can be chained

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The absolute path to the module |
| name | <code>string</code> | The name of the module (file name) |
| options | <code>object</code> | An object of options |
| options.bindtoclient | <code>boolean</code> \| <code>string</code> | Whether the module should be added as a property of the client class, can be true or a string which should be the name under which the module will go |
| options.instantiate | <code>string</code> | Whether a non-instantiated class should be expected, "bot" will instantiate it with the eris bot class, "client" with the client instance |