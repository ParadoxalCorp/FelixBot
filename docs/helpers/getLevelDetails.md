## Functions

<dl>
<dt><a href="#getLevelDetails">getLevelDetails(client, level)</a> ⇒ <code><a href="#LevelDetails">LevelDetails</a></code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#LevelDetails">LevelDetails</a></dt>
<dd></dd>
</dl>

<a name="getLevelDetails"></a>


## getLevelDetails(level) ⇒ [<code>LevelDetails</code>](#LevelDetails)
**Kind**: global function
**Returns**: [<code>LevelDetails</code>](#LevelDetails) - An object containing data about the experience required for this level and the next level

| Param | Type | Description |
| --- | --- | --- |
| level | <code>number</code> | The level to get the details from |

<a name="LevelDetails"></a>

## LevelDetails
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| level | <code>number</code> | The level |
| nextLevel | <code>number</code> | The next level (basically level + 1 yes) |
| expTillNextLevel | <code>number</code> | The experience left required to reach the next level |
| thisLevelExp | <code>number</code> | The experience required to reach this level |