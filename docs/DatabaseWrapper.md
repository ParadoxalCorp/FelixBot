<a name="DatabaseWrapper"></a>

### Update strategy

There is a default update strategy, as in, whenever DatabaseWrapper.getGuild() or DatabaseWrapper.getUser() is used,
The database entry will be "updated" to the latest data model in /util/helpers/references.js 
This behavior can be quite useful if properties are added to the data model, there won't be a need to anticipate the possibility that these new props will be missing,
as the changes will be reflected and always "up-to-date" objects will be returned from these methods.
However, this update behavior is quite simple and basically just "merge" the database entry and the data model in /util/helpers/references.js 
as in, all properties that the default data model has in common with the database entry will get the values these properties have in the database entry, then, this object will be returned.
If the changes to the data model are too important for the default update strategy to take care of it, a update function may be passed to the constructor.

## DatabaseWrapper
Wraps the most important methods of RethinkDB and does smart things in the background

**Kind**: global class
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rethink | <code>\*</code> | The object returned by the rethinkdbdash module after requiring it |
| updateFunc | <code>function</code> | The update function given in the constructor, if any |
| guildData | <code>\*</code> | The rethinkDB  table of guilds |
| userData | <code>\*</code> | The rethinkDB table of users |
| client | <code>\*</code> | The client instance given in the constructor |
| users | <code>Collection</code> | A collection of cached user entries |
| guilds | <code>Collection</code> | A collection of cached guild entries |
| healthy | <code>boolean</code> | A boolean representing whether the connection with the database is established |


* [DatabaseWrapper](#DatabaseWrapper)
    * [new DatabaseWrapper(client, updateFunc)](#new_DatabaseWrapper_new)
    * [.init()](#DatabaseWrapper+init) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.getGuild(id)](#DatabaseWrapper+getGuild) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getUser(id)](#DatabaseWrapper+getUser) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.set(data, type)](#DatabaseWrapper+set) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.createDatabase(name)](#DatabaseWrapper+createDatabase) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.createTable(name, databaseName)](#DatabaseWrapper+createTable) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="new_DatabaseWrapper_new"></a>

### new DatabaseWrapper(client, updateFunc)

| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | The client (or bot) instance |
| updateFunc | <code>function</code> | Optional, the function that should be called to update the retrieved entries from the database before returning them. This update function will be called instead of the default update strategy, with the "data" and "type" arguments, which are respectively the database entry and the type of the database entry (either "guild" or "user"). The update function must return an object, this is the object that the DatabaseWrapper.getGuild() and DatabaseWrapper.getUser() methods will return. |

<a name="DatabaseWrapper+init"></a>

### databaseWrapper.init() ⇒ <code>Promise.&lt;void&gt;</code>
Initialize the database wrapper, this will start the automatic progressive caching of the database and dynamically handle disconnections

**Kind**: instance method of [<code>DatabaseWrapper</code>](#DatabaseWrapper)
**Returns**: <code>Promise.&lt;void&gt;</code> - - An error will be rejected if something fail when establishing the changes stream
<a name="DatabaseWrapper+getGuild"></a>

### databaseWrapper.getGuild(id) ⇒ <code>Promise.&lt;object&gt;</code>
Get a guild database entry

**Kind**: instance method of [<code>DatabaseWrapper</code>](#DatabaseWrapper)
**Returns**: <code>Promise.&lt;object&gt;</code> - - The guild entry object, or null if not in the database

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The unique identifier of the guild to get |

<a name="DatabaseWrapper+getUser"></a>

### databaseWrapper.getUser(id) ⇒ <code>Promise.&lt;object&gt;</code>
Get a user database entry

**Kind**: instance method of [<code>DatabaseWrapper</code>](#DatabaseWrapper)
**Returns**: <code>Promise.&lt;object&gt;</code> - - The user entry object, or null if not in the database

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The unique identifier of the user to get |

<a name="DatabaseWrapper+set"></a>

### databaseWrapper.set(data, type) ⇒ <code>Promise.&lt;object&gt;</code>
Insert or update a user/guild in the database

**Kind**: instance method of [<code>DatabaseWrapper</code>](#DatabaseWrapper)
**Returns**: <code>Promise.&lt;object&gt;</code> - - The inserted/updated object, or reject the error if any

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | The data object to update/insert in the database |
| type | <code>string</code> | Can be "guild" or "user", whether the data object to be set is a guild or a user |

<a name="DatabaseWrapper+createDatabase"></a>

### databaseWrapper.createDatabase(name) ⇒ <code>Promise.&lt;boolean&gt;</code>
Create a new database

**Kind**: instance method of [<code>DatabaseWrapper</code>](#DatabaseWrapper)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - - true if success, otherwise, the error is rejected

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the database to create, if there is already a database with this name, the promise will be resolved and nothing will change |

<a name="DatabaseWrapper+createTable"></a>

### databaseWrapper.createTable(name, databaseName) ⇒ <code>Promise.&lt;boolean&gt;</code>
Create a new table in the specified database

**Kind**: instance method of [<code>DatabaseWrapper</code>](#DatabaseWrapper)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - - true if success, otherwise, the error is rejected

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the table to create, if there is already a table with this name, the promise will be resolved and nothing will change |
| databaseName | <code>string</code> | The name of the database to create the table in |