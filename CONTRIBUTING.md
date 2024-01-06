# Contributing

Ok so you are interested in contributing to Composite, awesome! Feel free to pitch in on whatever interests you and we'll be happy to help you contribute.

## Requirements

- [Docker](https://www.docker.com)
- docker-compose
- Makefile
- [nvm](https://github.com/nvm-sh/nvm)

## About the repository structure

Composite is divided into pieces. 3 exactly

- Backend (back folder)
- Frontend (front folder)
- Core (packages/core folder)

The repo is a monorepo managed with [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)

## Configuration

### Node version

Open a terminal at the root of the project

Run `nvm use`

If the node version of the project is not install on your machine, you will have to run

```nvm install```

### Github access token

Create a [personal access token (classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic)

Then you need to setup an env variable `NPM_TOKEN` in order to install github packages

Add this to your `.bashrc` / `.zshrc`:

`export NPM_TOKEN=github_access_token`

### Install dependencies

Then you should be able to run this command successfully

```npm i```

### Build packages

Run this command to build on your machine the packages

```make build_packages```

### Build containers

Run this command to build the docker containers locally, accordingly with your CPU architecture

```make build_containers```

### Build the database

```make build_database```

> ⚠️ Be careful about the output of this command. Ensure the migration are well applied, if you got an error such as: Error: P1001: Can't reach database server at `db`:`5432`, it just mean your database started after we tried to apply the migration. You might have to increase the sleep value define in the make command `build_database`, or to start the database in another process before.

### Start all the containers

```make start```

> ⚠️ Important information to know about watches.
If you dig deeper into the docker config, you can see in local development, there are a bunch of volumes mounting, to facilitate watch processes and hot reloading of front and back. Regarding the `Core` package, you have to start the watch locally, it's not made inside any docker container. And you actually have to start two different watch processes, one that will compile to `cjs`, and the other that will compile to `esm`. (Yes it sucks, but it is what it is for now, feel free to improve it)

#### Actually, why do we need two different watches for the core package? WTF?

It's because the backend framework, [NestJs](https://nestjs.com/) [does not support `esm` yet](https://github.com/nestjs/nest/issues/11046#issuecomment-1416983059), so we need to have a cjs version.

And in the same time, because on the frontend, with [Three.js](https://threejs.org/), we are using pieces of the library that are outside of the core lib (`three/examples/jsm/postprocessing/ShaderPass.js` for example), if the frontend import a cjs version of three.js, this will trigger import of two different instances of the library, which is completely not acceptable.

So basically, frontend consume `esm`, backend consume `cjs`.

#### How to start watch of core package

Go at the root of the core package `/packages/core` and run these two processes in two different terminal

```npm run dev:cjs```

```npm run dev:esm```

### Stop all the containers

```make stop```
