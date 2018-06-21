# Felix V4

Felix is powerful Discord bot that aims to provide advanced features (and some memes) will staying relatively easy to use. 

You can get the live bot with this [invite link](https://discordapp.com/oauth2/authorize?&client_id=327144735359762432&scope=bot&permissions=2146950271) and join the 
support server [here](https://discord.gg/Ud49hQJ)

## Tables of content

* [Tables of content](#tables-of-content)
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
- * [With music support](#with-music-support)
- * [Updating](#updating)

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

Until the 21/06/2018, the `4.0.0` release will benefit from:

* Minor enhancements if needed/minor new features
* Deprecations notices for potentially breaking changes before complete implementation  
* Bug-fixes

Additionally, bug-fixes only support will be effective **until new notice**, this means there is no defined date for the end of bug-fixes.
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

### With music support

The repository doesn't come along with all the necessary music components, to add music support, follow these steps:

* Make sure you run `npm install eris-lavalink` if you installed Felix without optional dependencies (this package is required for music)
* Make sure you have `Java` installed, as the music server use `Java` ([this](https://websiteforstudents.com/install-oracle-java-jdk-10-on-ubuntu-16-04-17-10-18-04-via-ppa/) should help if you are on Ubuntu 16.04. Java's JDK 10 is recommended, although the JDK 9 should work too)
* Download Lavalink [here](https://github.com/Frederikam/Lavalink#server-configuration), you should only need the `Lavalink.jar` and `application.yml` files. 
* Put these files wherever you want, preferably at the root of Felix's folder
* Configure the `application.yml` file as you wish, and make sure the settings in the (under the `options` > `music` field) `config.js` file of Felix are the same 
* Make sure to enable the music in the config file (still under `options` > `music`)
* Then what's left to do is to run the Lavalink server, at the time i write this, the command is `java -jar Lavalink.jar`, but be sure to double check on Lavalink's repository
* Run Felix, if no errors are logged once it has been launched, that means everything is alright 

**Note: You will always need to start the Lavalink server before launching Felix**

#### Running Lavalink with PM2

To keep the Lavalink server running, you can also run it with PM2 with the following command (the terminal must be opened in the folder where the Lavalink.jar file is)

> `pm2 start java --name="Lavalink" -- -jar Lavalink.jar`

#### Enabling premium status on a server

Even though Lavalink is highly efficient, streaming music use a lot of resources and for that reason this feature is restricted to donators. 
However in case of a self-host, you can enable it without being a donator with the following steps:

-Run the bot
-In the server you want, use the command:

> felix eval guildEntry.premium = true; client.database.set(guildEntry, 'guild') --await

-Enjoy your premium status

### Updating 

If a new release comes out, to update, you should follow the following steps:

* Backup the `config` file (you will need to refill the fields once the update is done, hence the backup)
* Run in a terminal shell in the folder where you cloned Felix: 
> git stash
* Regardless of the output of the above (unless the output is "critical error [...] explosions may occur" i guess), run:
> git pull
* Fill the config file again, as it most likely got overwritten in the process



