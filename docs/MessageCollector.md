## MessageCollector
A message collector which does not create a new event listener each collectors, but rather only use one added when its instantiated

**Kind**: global class
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| collectors | <code>object</code> | An object representing all the ongoing collectors |


* [MessageCollector](#MessageCollector)
    * [new MessageCollector(bot)](#new_MessageCollector_new)
    * [.awaitMessage(channelID, userID, [timeout], [filter])](#MessageCollector+awaitMessage) ⇒ <code>Promise.&lt;Message&gt;</code>

<a name="new_MessageCollector_new"></a>

### new MessageCollector(bot)
Instantiating this class create a new messageCreate listener, which will be used for all calls to awaitMessage


| Param | Type | Description |
| --- | --- | --- |
| bot | <code>\*</code> | The eris bot instance |

<a name="MessageCollector+awaitMessage"></a>

### messageCollector.awaitMessage(channelID, userID, [timeout], [filter]) ⇒ <code>Promise.&lt;Message&gt;</code>
Await a message from the specified user in the specified channel

**Kind**: instance method of [<code>MessageCollector</code>](#MessageCollector)
**Returns**: <code>Promise.&lt;Message&gt;</code> - The message, or false if the timeout has elapsed

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| channelID | <code>object</code> |  | The ID of the channel to await a message in |
| userID | <code>object</code> |  | The ID of the user to await a message from |
| [timeout] | <code>number</code> | <code>60000</code> | Time in milliseconds before the collect should be aborted |
| [filter] | <code>function</code> |  | A function that will be tested against the messages of the user, by default always resolve to true |