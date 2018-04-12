<a name="EconomyManager"></a>

## EconomyManager
Provides methods related to the economy, such as crediting, debiting or transferring coins

**Kind**: global class
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | The client instance given when instantiating this class |
| marketItems | <code>array.&lt;object&gt;</code> | The market items |
| slotsEvents | <code>array.&lt;object&gt;</code> | An array of slots events |


* [EconomyManager](#EconomyManager)
    * [new EconomyManager(client)](#new_EconomyManager_new)
    * [.transfer(params)](#EconomyManager+transfer) ⇒ <code>Promise.&lt;transactionSummary&gt;</code>
    * [.user(userEntry)](#EconomyManager+user) ⇒ <code>userEntry</code>
    * [.getItem(itemID)](#EconomyManager+getItem) ⇒ <code>object</code>

<a name="new_EconomyManager_new"></a>

### new EconomyManager(client)

| Param | Type | Description |
| --- | --- | --- |
| client | <code>\*</code> | The client instance |

<a name="EconomyManager+transfer"></a>

### economyManager.transfer(params) ⇒ <code>Promise.&lt;transactionSummary&gt;</code>
Transfer coins from one account to another, taking into account the coins limit, so the coins that can't be given because the receiver has hit the limit will be given back

**Kind**: instance method of [<code>EconomyManager</code>](#EconomyManager)
**Returns**: <code>Promise.&lt;transactionSummary&gt;</code> - A summary of the transaction

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | An object of parameters |
| params.from | <code>object</code> | Who is transferring their coins, aka who will be debited (this has to be the database entry) |
| params.to | <code>object</code> | Who is receiving the coins, aka who will be credited (this has to be the database entry) |
| params.amount | <code>number</code> | The amount of coins to transfer |

<a name="EconomyManager+user"></a>

### economyManager.user(userEntry) ⇒ <code>userEntry</code>
Add utility methods to the user database entry object, this should only be used for easier access to the data it contains

**Kind**: instance method of [<code>EconomyManager</code>](#EconomyManager)
**Returns**: <code>userEntry</code> - The given user entry with additional methods

| Param | Type | Description |
| --- | --- | --- |
| userEntry | <code>object</code> | The user database entry |

<a name="EconomyManager+getItem"></a>

### economyManager.getItem(itemID) ⇒ <code>object</code>
Get a market item by its ID

**Kind**: instance method of [<code>EconomyManager</code>](#EconomyManager)
**Returns**: <code>object</code> - The item

| Param | Type | Description |
| --- | --- | --- |
| itemID | <code>number</code> | The ID of the item |