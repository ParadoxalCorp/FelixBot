# Felix V4

## Tables of content

* [Tables of content](#tables-of-content)
* [Introduction](#introduction)
* [Commands arguments syntax](#commands-arguments-syntax)
- * [Without arguments](#without-arguments)
- * [With arguments separated by spaces](#with-arguments-separated-by-spaces)
- * [With arguments separated by vertical bars](#with-arguments-separated-by-vertical-bars)
* [V4 LTS release](#v4-lts-release)
- * [Goals](#goals)
- * [Long Term Support implications](#long-term-support-implications)
* [Contributing](#contributing)
- * [Naming conventions](#naming-conventions)
* [Installation](#installation)
- * [Installing Node.js](#installing-nodejs)
- * [Installing PM2](#installing-pm2)
- * [Installing RethinkDB](#installing-rethinkdb)
- * [Installing and setting up FelixV4](#installing-and-setting-up-felix-v4)
- - * [Running Felix without database](#running-felix-without-database)
- * [Updating](#updating)

## Introduction

Felix is a powerful Discord bot that aims to provide advanced features (and some memes) will staying relatively easy to use

## Commands arguments syntax

For consistency purposes, as well as to make it easy to learn, all commands that takes multiple arguments can first of all be called without specifying any arguments.

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

## V4 LTS Release 

The `4.0.0` Major release brings numerous changes, reworked features, new features, removed features and a brand-new back-end, it is also 
the only `Long Term Support` release and might be the last one to provide self-hosting support

### Goals

V4 has been written with numerous goals in mind, such as

* Meaningful code: V4 has been written with the will to write easily understandable code, regardless of the few nanoseconds lost by doing that
* Self-host support: V4 provides an extensive support for self-hosting, and has most of its main features configurable in the config file
* High speed: V4 tries to achieve the best speed possible, the most noticeable aspect of that is the perhaps excessive caching

### Long Term Support implications

As said before, the `4.0.0` release is a LTS release, we'll see why's that and what does it imply exactly

#### Reasons

* Stability: In previous releases, entire features have been removed (such as with 2.0.0 major, the 3.0.0 major and the 4.0.0 itself), and back-end changed without any warnings. This was not friendly at all with self-hosting, as for example, updating to a newer release to fix a bug might also remove stuff that you initially wanted

* Policy changes: For some reasons, mainly the fact that code from felix has been stolen without compliance to the license (sadly there is downsides to open-sourcing projects, this is because of this kind of people that we can't have nice things), **Felix will now be restricted-source** (as in: anyone who asks will still get access to the repository, need to ask though). This apply to future releases, therefore 
this repository will eventually differ from the live bot. So as a "goodbye gift" for good peoples who cares about the license, this release will stay open-source 
and receive a long-term support

#### Implications

As of it's official release, the `4.0.0` release will benefit from:

* Minor enhancements if needed
* Deprecations notices for potentially breaking changes before complete implementation  
* Bug-fixes

During 6 months. Additionally, bug-fixes only support will be effective **until new notice**, this means there is no defined date for the end of bug-fixes.
This roughly means V4 can be considered to work until a notice of dropped support is issued

## Contributing

**You should always ask me (on the Discord support server or something) if the feature you want to add is alright before making it, as i may decline 
a PR if i am not okay with it**

Any contribution is more than welcome, here are the steps toward a "cool" PR:

* Fork the repository
* Code as your heart wishes and, as i try to force a consistent code style in Felix, comply to the ESLint rules of this project
* Follow the [naming conventions](#naming-conventions)
* Open a pull request ! 

You can see the ESLint rules enabled on this project [here](https://github.com/ParadoxalCorp/FelixBot/blob/frosty-release/.eslintrc.json)
Note: You can comply to more rules if you want, the set of rules on Felix is very small and basic

Regarding the docs, most of the methods/classes documented in `./docs` are available under the same name as properties of the `client` instance.
To check their exact name, you may head to `./util/index.js`

### Naming conventions

Everything follow the lower camel case convention (`camelCase`), with the only exception of classes names which follow the upper camel case convention (`CamelCase`)

## Installation

**Note: The following installation guide assume you are using Ubuntu (16.04 is recommended, but it should work with later versions and Ubuntu 14.04)**

### Installing Node.js

**Important: Even if you already have Node.js installed, you should read this, as we want a very specific version of Node.js**

First we will need to install NVM, which stands for `Node.js Version Manager`,  to do so, open a new command line and enter the following

> `sudo apt-get update`

Then 

> `sudo apt-get install build-essential libssl-dev`

Once that is done, we can download and install nvm from it's [Github Page](https://github.com/creationix/nvm/releases) (newer versions may be available)

> `curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh -o install_nvm.sh`

Then

> `bash install_nvm.sh`

Followed by (actually, logging out and logging back in would do the same, do what you prefer)

> `source ~/.profile`

Once that is done, we can finally install Node.js, and for that, we need to enter the following

> `nvm install 10.0.0`

And, even though it should be automatic, run

> `nvm use 10.0.0`

To ensure that the used version is 10.0.0, to check if you are using the right version, you can run

> `node -v`

Which should print "v10.0.0" 

### Installing PM2

`PM2` is a process manager, while it is not actually needed, i highly recommend having it, especially because it keeps applications alive even when you log 
off from the server

To install it, just run 

> `npm install pm2 -g`

PM2 also provides features like automatically restarting applications when the server restart, if you want to learn more about that, check this [page](https://www.npmjs.com/package/pm2#startup-script-generation)

### Installing RethinkDB

Now it's the part where we get the database, technically, Felix v4 can work without it, but well, you will lack several features without it

You should only need to follow the instructions to install RethinkDB with binaries available [here](https://rethinkdb.com/docs/install/ubuntu/)

In rare cases, if your server is publicly available and if, for some reasons, you decide to make your RethinkDB instance available on the network, 
you should setup a password; RethinkDB has a [relatively advanced permissions system](https://www.rethinkdb.com/docs/permissions-and-accounts/) that you can 
use to restrict the access to Felix only. 

The Web UI however cannot be password-protected, so you should configure it to only allow connections from trusted IP addresses, there is some documentation about that available [here](https://www.rethinkdb.com/docs/security/#binding-the-web-interface-port)

### Installing and setting up Felix v4

You should now create a new folder somewhere, open your command-line there and enter the following

> `git clone https://github.com/ParadoxalCorp/FelixBot.git --branch frosty-release --single-branch`

(If you don't have `Git` installed, first run this)

> `sudo apt-get update`
> `sudo apt-get install git`

This should create a `FelixBot` folder with the v4 in it, jump in it, open the `config.js` file and fill it

The only things you actually need to fill are the `admins`, `ownerID` and `token` fields, everything else is set to default values and shouldn't need
to be changed in most cases

Then, install the dependencies Felix needs: (you need to run this in the same folder where you cloned)

> `npm install`

OR, if you don't want optional dependencies (like, i use Sentry for error reports, as it's a bit long to setup and you probably don't need it, you can skip that with the following command)

> `npm install --no-optional` 

Now it's time to setup the database, to do that, we need to launch the RethinkDB server.

**Important: Launching the server for the first time will create a `rethinkdb_data` folder where it has been launched, this is where the data will be saved. 
If you launch the server somewhere else after without moving this folder along, there will be no data**

With PM2: (You can change the name, it doesn't really matter)

> `pm2 start rethinkdb --name="RethinkDB" -- --bind all`

Without PM2:

> `rethinkdb --bind all`

(for more advanced usage, you can check out all the options [here](https://www.rethinkdb.com/docs/start-a-server/#starting-the-server))

Now is the time where we setup the database, once the RethinkDB database is launched, open your favorite browser and head to:

> `<YOUR_SERVER_IP>:8080` 

(`8080` is the default http port, if you changed it, well, change it here as well)

Which should lead you to a page like this:

![image](https://cdn.discordapp.com/attachments/356224772184735756/444142362072055828/unknown.png)

Click on the `Tables` tab at the top, click on the button `Add Database` and create a database with the name `data`,

Then, in this database, click on the `Add Table` button, and create a table named `guilds`, repeat the action to create two others tables
respectively named `users` and `stats`.

If you did everything well, it should look like this:

![image](https://cdn.discordapp.com/attachments/356224772184735756/444143113720823809/unknown.png)

If everything is alright, we can finally launch Felix ! (note: you need to be in the folder where you cloned Felix v4 to run the following commands)

With PM2: (Like rethinkdb, the name doesn't actually matter, you can change it to whatever you want)

> `pm2 start index.js --name="Felix" -- --colors && pm2 logs Felix`

The above command start Felix as `Felix` and enable colored logs, then log to the console Felix's logs

Without PM2:

> `node index.js`

#### Running Felix without database

You can run Felix without database, even though it is more for development purposes 

With PM2:

> `pm2 start index.js --name="Felix" -- --colors --no-db && pm2 logs Felix`

Without PM2:

> `node index.js --no-db`

### Updating 

If a new release comes out, to update, you should follow the following steps:

* Backup the `config` file (you will need to refill the fields once the update is done, hence the backup)
* Run in a terminal shell in the folder where you cloned Felix: 
> git stash
* Regardless of the output of the above (unless the output is "critical error [...] explosions may occur" i guess), run:
> git pull
* Fill the config file again, as it most likely got overwritten in the process



