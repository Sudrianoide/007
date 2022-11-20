# Projet 007

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A nice project with a nice description

---
## Requirements

For development, you will only need Node.js and a node global package, installed in your environment. (npm or yarn)

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm
      or
      $ sudo apt install yarn

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/), the [official NPM website](https://npmjs.org/) and the [official Yarn website](https://yarnpkg.com/)

If the installation was successful, you should be able to run the following command.

    $ node --version
    vx.x.x

    $ npm --version
    x.x.x
    or
    $ yarn --version
    x.x.x


If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

---

## Install

    $ git clone https://github.com/sudrianoide/007
    $ cd 007
    $ npm install

## Configure app

Open `config/default.json` then edit it with your settings. You will need:

- Server port
- Arduino serial port (like in Arduino IDE)

## Running the project

    $ npm start
    or 
    $ yarn start

## Running the project without Arduino

    $ npm start:dev
    or
    $ yarn start:dev