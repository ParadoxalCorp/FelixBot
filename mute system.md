## Felix's mute system

This section explains the whole system behind Felix's mutes

### Default behavior

By default, you need to create a role named `muted`, once created Felix will automatically log a mute in the mod-log if its added manually to a user and will 
give it to the specified user in the mute command.

The mute command takes care of the permissions for you, and will, every-time you mute someone, check all channels and deny the permissions 
of sending messages and reacting in each if it wasn't already the case.

### Custom muted roles/behavior

You might not want your role to be named `muted`, or want to set specific permissions yourself (like mute for only one channel) and maybe you even want
to have multiple muted roles. For all those cases, you can use custom muted roles which you can set with the `modconfig` command.

When adding a custom muted role, you will be prompted to input a name, this is optional and the default name will be the role name. The name will be used
in moderation cases and such like the following:

![Custom mute cases](https://cdn.discordapp.com/attachments/288695210723246080/408248059693105163/unknown.png)

Custom muted roles overrides Felix's default behavior, therefore Felix will not edit any permission and only give the role when the mute command is used.
You can also add the `muted` role as a custom one, it will override the default behavior as well.

If there is multiple different custom muted roles, each time a moderator uses the `mute` command, they will be prompted to select the role to add to the user.

Felix will also listen to roles changes on the server, meaning that if you manually add any muted role to a member, it will automatically be logged in the mod-log
(If enabled, of course)