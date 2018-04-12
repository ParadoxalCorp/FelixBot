<a name="Log"></a>

## Log
Provides some fancy colored logs for errors, warns and info, but also animated logs

**Kind**: global class
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| drafts | <code>Map</code> | A map of all the current draft-logs going on |


* [Log](#Log)
    * [.error(err, returnString)](#Log+error) ⇒ <code>void</code>
    * [.warn(warning, returnString)](#Log+warn) ⇒ <code>void</code>
    * [.info(info, returnString)](#Log+info) ⇒ <code>void</code>
    * [.draft(name, text)](#Log+draft) ⇒ <code>void</code>
    * [.endDraft(name, text, [succeed])](#Log+endDraft) ⇒ <code>void</code>

<a name="Log+error"></a>

### log.error(err, returnString) ⇒ <code>void</code>
Log to the console a fancy red error message

**Kind**: instance method of [<code>Log</code>](#Log)

| Param | Type | Description |
| --- | --- | --- |
| err | <code>\*</code> | The error to log |
| returnString | <code>Boolean</code> | Optional, default is false: Whether the string should be returned instead of being logged |

<a name="Log+warn"></a>

### log.warn(warning, returnString) ⇒ <code>void</code>
Log to the console a fancy yellow warning message

**Kind**: instance method of [<code>Log</code>](#Log)

| Param | Type | Description |
| --- | --- | --- |
| warning | <code>\*</code> | The warning to log |
| returnString | <code>Boolean</code> | Optional, default is false: Whether the string should be returned instead of being logged |

<a name="Log+info"></a>

### log.info(info, returnString) ⇒ <code>void</code>
Log to the console a fancy yellow warning message

**Kind**: instance method of [<code>Log</code>](#Log)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| info | <code>\*</code> |  | The warning to log |
| returnString | <code>Boolean</code> | <code>false</code> | Optional, default is false: Whether the string should be returned instead of being logged |

<a name="Log+draft"></a>

### log.draft(name, text) ⇒ <code>void</code>
Log an animated "loading" message

**Kind**: instance method of [<code>Log</code>](#Log)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> \| <code>Number</code> | The name of the draft-log, this is needed to retrieve it later |
| text | <code>\*</code> | The text to be logged |

<a name="Log+endDraft"></a>

### log.endDraft(name, text, [succeed]) ⇒ <code>void</code>
End an animated draft-log

**Kind**: instance method of [<code>Log</code>](#Log)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> \| <code>Number</code> |  | The name of the draft-log to end |
| text | <code>\*</code> |  | Text to update the log with |
| [succeed] | <code>Boolean</code> | <code>true</code> | Whether the operation succeed or not, will respectively result in a info or an error message |