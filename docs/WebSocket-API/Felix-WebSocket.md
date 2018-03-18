# Felix's WebSocket

Felix's websocket can be accessed with a private API token and provides real-time status data, as well as serves up-to-date database data

## Connecting

Connecting to the websocket is rather simple, unlike the REST API the token should here be passed as is and not as a `Bearer token`:

```js
const WebSocket = require('ws');

const ws = new WebSocket('ws://host:8090', null, {
    perMessageDeflate: false,
    headers: {
        'Authorization': 'P154008U84j3qK281567571ze.-U8Rd-0fv63A41U5Z2HTV2ab.f187572I874L3v7Q2mc3-p98.9918y96oDRfAhIa4tAd25788.6B06hv6560lyN482Q069$aJ2.hdw8R9M0yW7$jdah7fJ926u5.833s57J7fCUZe18dZZ116_2C.HV0SK1ZJ77F$9TL3eyO9L9p8.N8Yx55y3N6u98DTl879$880c.1K33047s3Z7b74O03xEska2W.pE804WFW4',
        'User-Agent': 'Baguette Corporation'
    }
});
```

While the `User-Agent` header is not required, it can be useful if there is a need to identify a connection.

If no `Authorization` header is provided or if the token is invalid/public, the websocket will explicitly reject the connection with a `403` error code

**Note**: To prevent broken connections (a state in which neither the client nor the server know that the connection is broken), Felix's websocket sends a `ping`
event every 30 seconds. All `WebSocket` implementations should automatically reply with a `pong` event, but you should still ensure that it is indeed the case
as Felix's websocket will terminate the connection if no `pong` is received within 30 seconds

## Requesting / sending data

All message sent to Felix's websocket should be JSON objects along with their code, any object without code or with an invalid code will not be processed.

The JSON object should be as the exemple below, where `code` is the code corresponding to the request and `data` the additional data needed to perform the request (if needed)

```js
ws.send(JSON.stringify({
    code: 20005,
    data: {
        baguette: 'baguette, indeed.'
    }
}))
```

  | Code | Name | Description |
| --- | --- | --- |
| 20001 | Heartbeat | An heartbeat without additional data, this will trigger a code `10001` reply from Felix's websocket. This should be sent at a regular interval of ~1 second |
| 20002 | Listeners update | Updates which guilds and users you are listening to, events regarding their database entry updates will be sent to you, see below the data object structure |

#### Listeners update data object

  | Property | Data Type | Description |
| --- | --- | --- |
| users | Array<String> | An array of users ID to listen to |
| guilds | Array<String> | An array of guilds ID to listen to |

**Note**: If you want to stop listening to some users/guilds update, you just need to send the above arrays without them

## Receiving data

Felix's websocket send data following the same pattern than the client does, with a `code` corresponding to the kind of data sent and the actual data in `data`

  | Code | Name | Description |
| --- | --- | --- |
| 10001 | Heartbeat ACK | Acknowledge the heartbeat sent by the client, see below the response object |
| 10002 | GDB Update | Emitted when a guild database entry you're listening to is updated, see the object below |
| 10003 | UDB Update | Emitted when a user database entry you're listening to is updated, see the object below |

#### Heartbeat ACK data object

  | Property | Data Type | Description |
| --- | --- | --- |
| receivedAt | Number | Timestamp of when Felix's websocket received the heartbeat |
| shards | Array<Object> | An array of [Eris shards objects](https://abal.moe/Eris/docs/Shard) except that the `Shard.latency` property is replaced by `Shard.ping` |
| guildsCount | Number | Number of guilds Felix is in |
| memoryUsage | Number | Current heap used by Felix |
| uptime | Number | Time in milliseconds since Felix is up |

#### GDB Update data object

  | Property | Data Type | Description |
| --- | --- | --- |
| guildID | String | The ID of the guild |
| guildData | Object | The updated guild data object |

#### UDB Update data object

  | Property | Data Type | Description |
| --- | --- | --- |
| userID | String | The ID of the user |
| userData | Object | The updated user data object |