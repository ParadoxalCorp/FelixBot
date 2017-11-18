# Endpoints 

* Endpoints are a way to access Felix's database from an external service, most requires a token

* Public tokens can only use GET requests, you need a private token to PUT or POST

* This is an experimental feature, you can try to ask for a public token (and the url btw) but private tokens are currently for Felix's devs only(unless you selfhost)

* You may simply put tokens in a `Authorization` header

* Endpoints which requires a public token are marked with a `*` and the ones which needs a private token are marked with a `**`

### GET `/api`

> Returns a 200 status code if the api is up

### [GET|POST|PUT] `api/userData/{userID?}`

##### GET `api/userData/{userID}?`*

UserID can be: {

    Nothing(`/userData`): Will return the whole user database in an array

    An array(`/userData/[140149699486154753, anotherFancyID, andMaybeAnotherOne?]`): Will return an array of user objects of the specified users id(if any)

    An ID(`/userData/140149699486154753`): Will return the user object of the specified user if any, returns undefined otherwise

}

If a private token is used, an additional `mutualGuilds` property containing Eris guild objects will be added to the user object

##### [POST|PUT] `api/userData`**

You have to POST or PUT a valid user object, all of the keys must be of the same type of all the user objects

The User object must be: A stringified(JSON) User object

> Returns true if the operation is a success or return an array of all the invalid keys found when validating the object

### [GET|POST|PUT] `api/guildData/{guildID?}`

##### GET `api/guildData/{guildID}?`*

UserID can be: {
    
    Nothing(`/guildData`): Will return the whole guild database in an array

    An array(`/guildData/[140149699486154753, anotherFancyID, andMaybeAnotherOne?]`): Will return an array of guild objects of the specified guilds id(if any)

    An ID(`/guildData/140149699486154753`): Will return the guild object of the specified guild if any, returns undefined otherwise

}

##### [POST|PUT] `api/guildData`**

You have to POST or PUT a valid guild object, all of the keys must be of the same type of all the guild objects

The Guild object must be: A stringified(JSON) Guild object

> Returns true if the operation is a success or return an array of all the invalid keys found when validating the object

### GET `api/clientData/{clientValue}`**

Fetch a specific client value like the guilds or users