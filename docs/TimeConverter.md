## Classes

<dl>
<dt><a href="#timeConverter">timeConverter</a></dt>
<dd><p>Provides some utility methods to parse time</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ElapsedTime">ElapsedTime</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#HumanDate">HumanDate</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="timeConverter"></a>

## timeConverter
Provides some utility methods to parse time

**Kind**: global class

* [timeConverter](#timeConverter)
    * [.toElapsedTime(ms, [formatted])](#timeConverter+toElapsedTime) ⇒ [<code>ElapsedTime</code>](#ElapsedTime)
    * [.toHumanDate(timestamp, [formatted])](#timeConverter+toHumanDate) ⇒ [<code>HumanDate</code>](#HumanDate)

<a name="timeConverter+toElapsedTime"></a>

### timeConverter.toElapsedTime(ms, [formatted]) ⇒ [<code>ElapsedTime</code>](#ElapsedTime)
Calculate and return how many elapsed seconds, minutes, hours and days the given milliseconds represent

**Kind**: instance method of [<code>timeConverter</code>](#timeConverter)
**Returns**: [<code>ElapsedTime</code>](#ElapsedTime) - An object or a string depending on if formatted is true or false

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| ms | <code>number</code> |  | The milliseconds to calculate |
| [formatted] | <code>boolean</code> | <code>false</code> | Whether or not the elapsed time should be returned already in a readable string format |

<a name="timeConverter+toHumanDate"></a>

### timeConverter.toHumanDate(timestamp, [formatted]) ⇒ [<code>HumanDate</code>](#HumanDate)
Convert a UNIX timestamp(in ms) to human date

**Kind**: instance method of [<code>timeConverter</code>](#timeConverter)
**Returns**: [<code>HumanDate</code>](#HumanDate) - An object or a string depending on if formatted is true or false

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| timestamp | <code>number</code> |  | The UNIX timestamp in ms to convert |
| [formatted] | <code>boolean</code> | <code>true</code> | Whether or not the date should be returned already in a readable string format |

<a name="ElapsedTime"></a>

## ElapsedTime : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| elapsedTime.days | <code>number</code> | Number of days elapsed with the given milliseconds |
| elapsedTime.hours | <code>number</code> | Number of hours elapsed with the given milliseconds |
| elapsedTime.minutes | <code>number</code> | Number of minutes elapsed with the given milliseconds |
| elapsedTime.seconds | <code>number</code> | Number of seconds elapsed with the given milliseconds |

<a name="HumanDate"></a>

## HumanDate : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| humanDate.seconds | <code>number</code> | The second |
| humanDate.minutes | <code>number</code> | The minute |
| humanDate.hours | <code>number</code> | The hour |
| humanDate.day | <code>number</code> | The day |
| humanDate.month | <code>number</code> | The month |
| humanDate.year | <code>number</code> | The year |