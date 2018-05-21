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