### Moderation cases structure

A moderation case type can be programmatically identified with their `type` property, this property contains a code number corresponding to the type following the table below:

  | Code | Corresponding type | Description |
| --- | --- | --- |
| <code>2999</code> | Warn | Self-explanatory |
| <code>3000</code> | Automatic-warn | Self-explanatory |
| <code>3001</code> | Revoke | When a warn is revoked |
| <code>3002</code> | Mute | Self-explanatory |
| <code>3003</code> | Global-mute | When all the existing muted roles are added, needs at least two muted roles |
| <code>3004</code> | Automatic-mute | Self-explanatory |
| <code>3005</code> | Custom muted role added | A custom muted role has been added to the user, either automatically or with a command |
| <code>3006</code> | Unmute | Self-explanatory |
| <code>3007</code> | Custom muted role removed | A custom muted role has been removed from the user |
| <code>3008</code> | Global-unmute | When all the muted roles of a user are removed, the user needs to have at least two muted roles |
| <code>3009</code> | Kick | Self-explanatory |
| <code>3010</code> | Automatic-kick | Self-explanatory |
| <code>3011</code> | Ban | Self-explanatory |
| <code>3012</code> | Automatic-ban | Self-explanatory |
| <code>3013</code> | Soft-ban | Self-explanatory |
| <code>3014</code> | Unban | Self-explanatory |