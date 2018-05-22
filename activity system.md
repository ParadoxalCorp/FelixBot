# Experience System

## Level up messages

### Tags

When setting up your own level up messages, you can use a few tags which will be replaced according to the context, here's the list of the tags you can use:

* `%USER%` => Will be replaced by the mention of the user who just levelled up, like `@Baguette`
* `%USERNAME%` => Will be replaced by the username of the user who just levelled up, like `Baguette`
* `%USERTAG%` => Will be replaced by the username#discriminator of the user who just levelled up, like `Baguette#0001`
* `%LEVEL%` => Will be replaced by the level the user just reached
* `%WONROLES%` => This is a bit more complicated, the `%WONROLES%` tag will be replaced by `and won the role(s) <role list>`, unless no roles has been won, then it is replaced by nothing. Let's take an example:

Let's say our custom level up message is set to: `Hey %USER% you just levelled up to level %LEVEL% %WONROLES% !`

Now, let's say we set the roles `baguette` and `croissant` to be given at level 2, when the user reach the level 2, it will look like this:

> Hey @Baguette you just levelled up to level 2 and won the role(s) `baguette`, `croissant` !

And when the user reach the level 3, at which we didn't set any roles to be given, it will look like this:

> Hey @Baguette you just levelled up to level 3 !

Hai, in the case no roles is set to be given, the `%WONROLES%` tag is just removed

### Target 

You have a full control of where the level up messages are sent, you can set it so they will be sent to a specific channel, or directly to the member who just levelled up in their DMs. 

By default, they are sent to the channel where the member has sent the message that made them level up, you can always reset to this default behavior whenever you want if you changed it.

### Settings

Like the overall experience system settings, if you disable the level up messages, the settings you set will stay; You therefore won't have to set it up again, you'll just need to enable them again whenever you want.

## Roles

### Important note

For this feature to work perfectly, Felix needs the `Manage Roles` permission, and Felix's highest role needs to be above all roles you set up to be given at some point. Otherwise, roles may not be added/removed and therefore it won't work as expected

### Static and removable roles

When you'll add a new role to be given at the specified level, you will be prompted to define whether the role is static or not; 
Basically static roles won't move an inch, so what we are going to talk about are the removable roles.

Roles set as removable will be removed from the member whenever they reach a new level and win a/multiple new roles. This can be useful 
if you want to setup roles showing how active a user is and prevent too active members from having 100 roles. While static roles 
will stay where they are, so you can set a role that gives access to a special channel as static to ensure that the member will always keep their access 
to this channel for example. 

