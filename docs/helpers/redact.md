<a name="redact"></a>

## redact(client, string) ⇒ <code>string</code>
A function that replace all critical credentials from a string (e.g: token, api keys, database host...). Useful to filter out eval and repl outputs

**Kind**: global function
**Returns**: <code>string</code> - The given strings with credentials replaced

| Param | Type | Description |
| --- | --- | --- |
| client | <code>\*</code> | The client instance |
| string | <code>string</code> | The string to replace credentials for |