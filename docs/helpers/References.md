<a name="References"></a>

## References
This class provides all the default data model the process may use, for example, the default data models for guild and user entries in the database

**Kind**: global class
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaultPermissions | <code>object</code> | The default permissions object |
| permissionsSet | <code>object</code> | The default permissions object, but with empty arrays |


* [References](#References)
    * [.guildEntry(id)](#References+guildEntry) ⇒ <code>object</code>
    * [.userEntry(id)](#References+userEntry) ⇒ <code>object</code>
    * [.transactionData(data)](#References+transactionData) ⇒ <code>object</code>

<a name="References+guildEntry"></a>

### references.guildEntry(id) ⇒ <code>object</code>
Returns the default guild entry structure used in the database

**Kind**: instance method of [<code>References</code>](#References)
**Returns**: <code>object</code> - A guild entry

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The ID of the guild |

<a name="References+userEntry"></a>

### references.userEntry(id) ⇒ <code>object</code>
Returns the default user entry structure used in the database

**Kind**: instance method of [<code>References</code>](#References)
**Returns**: <code>object</code> - A user entry

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The ID of the user |

<a name="References+transactionData"></a>

### references.transactionData(data) ⇒ <code>object</code>
**Kind**: instance method of [<code>References</code>](#References)
**Returns**: <code>object</code> - The transaction data object

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | An object of data |
| data.amount | <code>number</code> | The amount of coins that has been debited/credited(negative if debited, positive if credited) |
| data.from | <code>string</code> | Username#Discriminator of the user from who the coins once belonged |
| data.to | <code>string</code> | Username#Discriminator of who received the coins |
| data.reason | <code>string</code> | The reason of the transfer (automatic, intended..) |