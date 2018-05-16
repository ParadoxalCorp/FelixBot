# Felix V4

Regarding the docs, most of the methods/classes documented in `./docs` are available under the same name as properties of the `client` instance.
To check their exact name, you may head to `./util/index.js`

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
