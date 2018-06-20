# Tables of content

* [Tables of content](#tables-of-content)
* [Commands arguments syntax](#commands-arguments-syntax)
- * [Without arguments](#without-arguments)
- * [With arguments separated by spaces](#with-arguments-separated-by-spaces)
- * [With arguments separated by vertical bars](#with-arguments-separated-by-vertical-bars)
- * [Additional example](#additional-example)
* [Activity system](#activity-system)
- * [Level up messages](#level-up-messages)
- - * [Level up tags](#level-up-tags)
- - * [Level up target](#level-up-target)
- - * [Level up messages settings](#level-up-messages-settings)
- * [Roles](#roles)
- - * [Important note](#important-note)
- - * [Static and removable roles](#static-and-removable-roles)
- - * [Automatic roles synchronization](#automatic-roles-synchronization)
- - * [Audit log tracking](#audit-log-tracking)
* [Greetings and farewell system](#greetings-and-farewell-system)
- * [Greetings and farewell tags](#greetings-and-farewell-tags)
- * [Greetings and farewell target](#greetings-and-farewell-target)
- * [Greetings and farewell settings](#greetings-and-farewell-settings)
* [Permissions system](#permissions-system)
- * [Consistency with Discord](#consistency-with-discord)
- * [Terms references](#terms-references)
- * [Category permissions and command permissions](#category-permissions-and-command-permissions)
- * [Permissions priority and inheritance](#permissions-priority-and-inheritance)
- * [Special case for roles permissions groups](#special-case-for-roles-permissions-groups)
- * [Additional notes](#additional-notes)

## Commands arguments syntax

For consistency purposes, as well as to make it easy to learn, all commands that takes multiple mandatory arguments can be called without specifying any arguments, you will 
then be prompted for each argument.

To explore all the ways of calling "complicated" commands, we'll take the `sar` (Self Assignable Roles) command, which allows you to either add a self-assignable role, remove one or list the self-assignable roles set.

#### Without arguments

> felix sar

Calling the command like that will prompt you what action you want to do (add a role, remove one and such) and the name of the role if you didn't choose to list them.
This is a longer but easier way.

#### With arguments separated by spaces

> felix sar add baguette

Here we specify both the action (`add`) and the name of the role (`baguette`) we want to add in a single message, this is the fastest way but there is an issue with it, we can see it with
the following example:

> felix sar add mighty baguette

Because arguments are separated by spaces, in the case where an argument contain a space (like here, the role name has a space between `mighty` and `baguette`) only 
part of the argument will be taken into account, or even worse, the last part will be taken as another argument.

In this case, only `mighty` would be considered as the role name, and therefore Felix won't be able to find it. This can be avoided by calling the command without arguments like above, or by calling the command with arguments separated by `|` like below

#### With arguments separated by vertical bars 

To avoid the issue described above, we can call commands like this:

> felix sar add | mighty baguette

As arguments are separated by `|` instead of spaces, you can specify arguments that have spaces without issues, it is a bit slower though, especially for phone users

#### Additional example

As said all above, this apply to all commands, so it works for the `experience` command too for example:

> felix experience add_role | mighty baguette | 10 | static

## Activity system

### Level up messages

#### Level up tags

When setting up your own level up messages, you can use a few tags which will be replaced according to the context, here's the list of the tags you can use:

* `%USER%` => Will be replaced by the mention of the user who just levelled up, like `@Baguette`
* `%USERNAME%` => Will be replaced by the username of the user who just levelled up, like `Baguette`
* `%USERTAG%` => Will be replaced by the username#discriminator of the user who just levelled up, like `Baguette#0001`
* `%LEVEL%` => Will be replaced by the level the user just reached
* `%WONROLES%` => This is a bit more complicated, the `%WONROLES%` tag will be replaced by `and won the role(s) <role list>`, unless no roles have been won, then it is replaced by nothing. Let's take an example:

Let's say our custom level up message is set to: `Hey %USER% you just levelled up to level %LEVEL% %WONROLES% !`

Now, let's say we set the roles `baguette` and `croissant` to be given at level 2, when the user reaches level 2, it will look like this:

> Hey @Baguette you just levelled up to level 2 and won the role(s) `baguette`, `croissant` !

And when the user reaches level 3, at which we didn't set any roles to be given, it will look like this:

> Hey @Baguette you just levelled up to level 3 !

Hai, in the case no roles is set to be given, the `%WONROLES%` tag is just removed

#### Level up target 

You have a full control of where the level up messages are sent, you can set it so they will be sent to a specific channel, or directly to the member who just levelled up in their DMs. 

By default, they are sent to the channel where the member has sent the message that made them level up, you can always reset to this default behavior whenever you want if you changed it.

#### Level up messages settings

Like the overall experience system settings, if you disable the level up messages, the settings you set will stay; You therefore won't have to set it up again, you'll just need to enable them again whenever you want.

### Roles

#### Important note

For this feature to work perfectly, Felix needs the `Manage Roles` permission, and Felix's highest role needs to be above all roles you set up to be given at some point. Otherwise, roles may not be added/removed and therefore it won't work as expected

#### Static and removable roles

When you'll add a new role to be given at the specified level, you will be prompted to define whether the role is static or not; 
Basically static roles won't move an inch, so what we are going to talk about are the removable roles.

Roles set as removable will be removed from the member whenever they reach a new level and win a/multiple new roles. This can be useful 
if you want to setup roles showing how active a user is and prevent too active members from having 100 roles. While static roles 
will stay where they are, so you can set a role that gives access to a special channel as static to ensure that the member will always keep their access 
to this channel for example. 

#### Automatic roles synchronization 

If you change the requirements for some roles and there are members who already won these roles/already passed the requirement, their roles will eventually be 
synchronized with how they should be. When a member level up, Felix check and remove the roles from a member if they aren't supposed to have it (as in: If the member
level is lower than the role requirement) and give them the roles they should have (as in: The roles set to be given at this level and lower)

#### Audit log tracking

If you are unsure about the changes in the roles of a member, you can always check the audit logs to see why the changes happened; As Felix always leave a reason 
in the audit logs to each role change

## Greetings and farewell system

### Greetings and farewell tags

When setting up your greetings and farewells message, you can use a few tags which will be replaced according to the context, here's the list of the tags you can use:

* `%USER%` => Will be replaced by the mention of the user who just joined, like `@Baguette`. This tag isn't available for the farewell message
* `%USERNAME%` => Will be replaced by the username of the user who just joined, like `Baguette`
* `%USERTAG%` => Will be replaced by the username#discriminator of the user who just joined, like `Baguette#0001`
* `%GUILD%` => Will be replaced by the name of the server
* `%MEMBERCOUNT%` => Will be replaced by the new count of members in this server

### Greetings and farewell target 

You have a full control of where the greetings messages are sent, you can set it so they will be sent to a specific channel, or directly to the member who just joined.
However, when a member leaves, the farewell message can't be sent to their DMs

### Greetings and farewell settings

Like the experience system settings, if you disable the greetings, the settings you set will stay; You therefore won't have to set it up again, you'll just need to enable them again whenever you want.

## Permissions system

Felix's permissions system goes deep, it might take some time to fully understand, but gives you huge control over who can use what commands

### Consistency with Discord 

First thing to know is that Felix still tries to stay a bit consistent with how Discord's permissions system work.
As in, few particularities of Discord exist as well in Felix's permissions system; For example, like users with the `Administrator` permission
bypass pretty much everything on Discord, **they also bypass Felix's permissions.** 

(This is something to remember, you can't test the permissions on another user with the `Administrator` permission, they will bypass the permissions)

### Terms references

To not get confused, here's what the terms used below means:

`Permission`: Either a command or a category permission

`Permissions group`: A group of permissions, as in, all global permissions represent a group of permissions, and all permissions for a specific role represent another group.

### Category permissions and command permissions

To make things easier, if you want to restrict a whole category of commands for example, Felix allows you to do it at once with the `<category_name>*` syntax.
The `*` means that we are targeting the whole category. 

However, single commands permissions have higher priority than their categories, which means for example that if we restrict the `economy*` permission
for the entire server, which represents the whole `economy` category, but we allow the `balance` permission, users will be able to use the `balance`
command but not any of the others commands of the `economy` category.

### Permissions priority and inheritance

All permissions groups inherits the permissions of the permissions groups with lower priority, as well as override the permissions they themselves set (the set permissions
are another important concept directly related to the inheritance)

![image](https://cdn.discordapp.com/attachments/356224772184735756/458270286672822273/felix-permissions-inheritance.png)

Pardon the ugly schema, but figured it would be boring to only read text. This image though, regardless of being ugly or not, accurately represent the inheritance 
and priority pyramid. 

The `effective permissions` group is the result of the inheritance and priority rules applied on the lower permissions groups, it decides what commands a user can use and what commands they cannot use. The `default permissions` is the permissions group set by default globally on the bot.

Each permissions group will inherit the permissions of the lower groups, then apply their permissions over it (the priority rule). To illustrate that, we will take the following example:

First, we'll see what the default permissions group exactly set. At the time when this is written, the default permissions group allow the following permissions:

> generic*, fun*, economy*, misc*, utility*, music*

And restrict the following:

> moderation*, settings*, forceskip

Meaning that by default, all users can use all commands of the `generic`, `fun` , `economy`, `misc`, `utility` and `music` (except the `forceskip` command) categories.
While only the users with the `Administrator` discord permissions can use the commands from the `moderation` and `settings` categories (and the `forceskip` command).

So, let's say we want to restrict the `ping` command globally, we'll just restrict the permission `ping` in the `global` permissions group which in practice looks like:

> felix setpermission ping | false | global

And there we go. Because the `global` permissions group inherits the permissions from the `default` permissions group, the users can still use all the other commands
like before, and because of the priority rule (and the command > category rule in this case) that overrides the `generic*` permission of the `default` group by the `ping` permission of the `global` group, the non-administrator users can't use the `ping` command anymore.

Or if we want to give access to the `moderation` commands to the users with the `Moderator` role, which in practice looks like:

> felix setpermission moderation* | true | role | Moderator

The inheritance and priority rules do the rest, you don't have anything else to do

### Special case for roles permissions groups

It is a bit different for the roles permissions groups though, because while you can't realistically be in two channels at once or be two users at once, you can have multiple roles, so what if you have multiple roles on which permissions are set ? What becomes the effective permissions then ?

Well, in that case, the inheritance and priority rules still applies between the roles permissions groups, however in this case it relies on the role's position to make a priority pyramid. The highest roles in the roles list will inherit the permissions of the lower roles, and apply their permissions over them, leaving nothing uncontrolled.

### Additional notes

The same permission cannot be both allowed and restricted on the same permission group. If you for example try to allow a permission that is already restricted
on a permission group, the restriction will be removed and only the allowed will stay
