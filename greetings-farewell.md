# Greetings and farewell system

## Tags

When setting up your own level up messages, you can use a few tags which will be replaced according to the context, here's the list of the tags you can use:

* `%USER%` => Will be replaced by the mention of the user who just joined, like `@Baguette`. This tag isn't available for the farewell message
* `%USERNAME%` => Will be replaced by the username of the user who just joined, like `Baguette`
* `%USERTAG%` => Will be replaced by the username#discriminator of the user who just joined, like `Baguette#0001`
* `%GUILD%` => Will be replaced by the name of the server
* `%MEMBERCOUNT%` => Will be replaced by the new count of members in this server

## Target 

You have a full control of where the greetings messages are sent, you can set it so they will be sent to a specific channel, or directly to the member who just joined.
However, when a member leave, the farewell message can't be sent to their DMs

## Settings

Like the experience system settings, if you disable the greetings, the settings you set will stay; You therefore won't have to set it up again, you'll just need to enable them again whenever you want.


