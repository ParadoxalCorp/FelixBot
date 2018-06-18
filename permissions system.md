# Permissions system

Felix's permissions system goes deep, it might be a bit long to fully understand, but gives you huge control over who can use what commands

## Consistency with Discord 

First thing to know is that Felix still tries to stay a bit consistent with how Discord's permissions system work.
As in, few particularities of Discord exist as well in Felix's permissions system; For example, like users with the `Administrator` permission
bypass pretty much everything on Discord, **they also bypass Felix's permissions.** 

(This is something to remember, you can't test the permissions on another user with the `Administrator` permission, they will bypass the permissions)

## Terms references

To not get confused, here's what the terms used below means:

`Permission`: Either a command or a category permission

`Permissions group`: A group of permissions, as in, all global permissions represent a group of permissions, and all permissions for a specific role represent another group.

## Category permissions and command permissions

To make things easier, if you want to restrict a whole category of commands for example, Felix allows you to do it at once with the `<category_name>*` syntax.
The `*` means that we are targeting the whole category. 

However, single commands permissions have higher priority than their categories, which means for example that if we restrict the `economy*` permission
for the entire server, which represents the whole `economy` category, but we allow the `balance` permission, users will be able to use the `balance`
command but not any of the others commands of the `economy` category.

## Permissions priority and inheritance

All permissions groups inherits the permissions of the permissions groups with lower priority, as well as override the permissions they themselves set (the set permissions
are another important concept directly related to the inheritance)

![image](https://cdn.discordapp.com/attachments/356224772184735756/458270286672822273/felix-permissions-inheritance.png)

Pardon the ugly schema, but figured it would be boring to only read text. This image though, regardless of being ugly or not, accurately represent the inheritance 
and priority pyramid. 

The `effective permissions` group is the result of the inheritance and priority rules applied on the lower permissions groups, it decide what commands can a user use and what commands they cannot. The `default permissions` is the permissions group set by default globally on the bot.

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

## Special case for roles permissions groups

It is a bit different for the roles permissions groups though, because while you can't realistically be in two channels at once or be two users at once, you can have multiple roles, so what if you have multiple roles on which permissions are set ? What becomes the effective permissions then ?

Well, in that case, the inheritance and priority rules still applies between the roles permissions groups, however in this case it relies on the role's position to make a priority pyramid. The highest roles in the roles list will inherit the permissions of the lower roles, and apply their permissions over them, leaving nothing uncontrolled.

## Additional notes

The same permission cannot be both allowed and restricted on the same permission group. If you for example try to allow a permission that is already restricted
on a permission group, the restriction will be removed and only the allowed will stay

