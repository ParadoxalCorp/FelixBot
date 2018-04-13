<a name="IPCHandler"></a>

## IPCHandler
**Kind**: global class
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| requests | <code>Collection</code> | A collection of the current ongoing requests |
| client | <code>\*</code> | The client instance given in the constructor |


* [IPCHandler](#IPCHandler)
    * [.getSomeStats()](#IPCHandler+getSomeStats) ⇒ <code>Promise.&lt;array&gt;</code>
    * [.broadcastReload(type, path, [name], [options])](#IPCHandler+broadcastReload) ⇒ <code>Promise.&lt;array&gt;</code>

<a name="IPCHandler+getSomeStats"></a>

### ipcHandler.getSomeStats() ⇒ <code>Promise.&lt;array&gt;</code>
Dummy method to test the concept

**Kind**: instance method of [<code>IPCHandler</code>](#IPCHandler)
**Returns**: <code>Promise.&lt;array&gt;</code> - An array of clusters with their stats
<a name="IPCHandler+broadcastReload"></a>

### ipcHandler.broadcastReload(type, path, [name], [options]) ⇒ <code>Promise.&lt;array&gt;</code>
**Kind**: instance method of [<code>IPCHandler</code>](#IPCHandler)
**Returns**: <code>Promise.&lt;array&gt;</code> - An array containing the responses of each clusters, if the reload failed in at least one cluster, the promise is rejected

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of the file that should be reloaded, either "command", "event" or "module" |
| path | <code>string</code> | The absolute path of the file that should be reloaded |
| [name] | <code>string</code> | If a module, the name of the module |
| [options] | <code>object</code> | If a module, the options that Reloader.reloadModule() expect |