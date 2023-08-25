# Bequest workspaces

## Graphical representation of the workspace

![Graph](./deps.svg)

## Requirements

[nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## Init the workspaces

Use proper nodeJS version:
`nvm use`

Install latest version of npm:
`npm i -g npm`

Run this command at the root of the workspaces to install all the dependencies of all modules and create symlinks between shared packages:
`npm i`

Configure `.env` for each apps. To do that, you can copy paste the content of the file `.env.template` into your file `.env` and you are supposed to have a config ready for the local development.

Run this command to initialize the database. Make sure your local database is running
`npm run prisma:migrate:reset -w api`

Run this command to build all packages locally
`npm run build -w packages`

### Other commands

Command
`npm run graph`

require you previously installed this on your machine
`brew install graphviz`
