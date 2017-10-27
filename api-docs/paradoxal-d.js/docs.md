These docs only contains edited/added stuff
# Member

## Properties

### username

`since: 2.5.0`

`description: The username of the member, identical to User.username`
   
### discriminator

`since: 2.5.0`

`description: The discriminator(#something) of the member, identical to User.discriminator`
   
### tag

`since: 2.5.0`

`description: The tag(username#discriminator) of the member, identical to User.tag`

# Message

## Methods

Note: * marks optional parameters

### awaitReply(options*)
`since: 2.5.0`

`description: Await the message author reply, returns an object with a "reply" property containing the reply's Message and a "query" containing the optional query Message`

`returns: Promise<Object>`

```js
Message.awaitReply({
   channel: Channel, //*, The channel in which a reply should be awaited, default is this
   message: "uwu", //*, A message to send with, takes the same message structure than Channel.send()
   timeout: 30000 //*, Time in milliseconds before the collector should end, default is 60000
}).then(response => {
   console.dir(response.reply);
   response.query.delete();
});

### getUserResolvable(options*)

`since: 2.5.0`

`description: Resolve ids/usernames/nicknames/partial usernames/nicknames(and mentions) to users, automatically query the user when multiple match happens`

`returns: Promise<Collection<UserID, User>>`

```js
Message.getUserResolvable({
   guildOnly: false, //*, Whether the resolve attempt should be limited to only this guild members, default is true
   charLimit: 2 //*,  How many characters needed for a word to be included in the resolve attempt
}).then(collection => console.log(`Resolved ${collection.size} users`);
```

### getRoleResolvable(options*)

`since: 2.5.0`

`description: Resolve ids/names/partial names and mentions to roles, automatically query the user when multiple match happens`

`returns: Promise<Collection<RoleID, Role>>`

```js
Message.getRoleResolvable({
   charLimit: 2 //*,  How many characters needed for a word to be included in the resolve attempt
}).then(collection => console.log(`Resolved ${collection.size} roles`);
```

### getChannelResolvable(options*)

`since: 2.5.0`

`description: Resolve ids/names/partial names and mentions to channels, automatically query the user when multiple match happens`

`returns: Promise<Collection<ChannelID, Channel>>`

```js
Message.getChannelResolvable({
   charLimit: 2 //*,  How many characters needed for a word to be included in the resolve attempt
}).then(collection => console.log(`Resolved ${collection.size} channels`);
```

### getGuildResolvable(options*)

`since: 2.5.0`

`description: Resolve ids/names/partial names and mentions to guilds, automatically query the user when multiple match happens`

`returns: Promise<Collection<GuildID, Guild>>`

```js
Message.getGuildResolvable({
   charLimit: 2 //*,  How many characters needed for a word to be included in the resolve attempt
}).then(collection => console.log(`Resolved ${collection.size} guilds`);
```


   
    
