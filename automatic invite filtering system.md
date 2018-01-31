## Felix's automatic invite filtering system

Sometimes bad things happen, a random user spawn out of nowhere and starts spamming invites to their server and that's like bad ;-;
Especially when there's no moderator looking at this moment, that's why Felix's automatic invite filtering system has been developed

### Behavior

The system is disabled by default, once enabled Felix will start deleting automatically every message containing invites.

You can enable automatic warns for advertisements, so every-time a user try to advertize their servers they will be automatically warned and thus
triggers the action set to be taken at specific warns count if they continue.

Regardless of if the warnings are enabled, the message will only be deleted and the user won't be warned if the invite can't be resolved to an actual server

Also, messages from administrator will be ignored by the automatic filtering system and therefore will never be deleted.

### White-listing servers

Just to avoid any misunderstanding, Felix sometimes refer to servers as "guilds", this is the name of the servers rather than "servers" in Discord's API so this is why ^

You can whitelist servers in the `modconfig` command, messages containing invites to white-listed servers won't be deleted.

White-listing is by ID, to get a server ID you need to have the `Developer mode` enabled (User settings => Appearance => Developer mode) then right click on the server
and click on `Copy ID`
