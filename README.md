# Composite - 2.5D coop platformer on the web

The development of this project is streamed on this [Twitch channel](https://www.twitch.tv/elboursico). Take a look and support me if you like it 🙏

Last released of the project => http://staging.compositethegame.com

## Development

### Requirements

- Docker
- docker-compose
- Makefile

### Configuration

You need to setup a env variable `NPM_TOKEN` in order to install github packages

Add this to your `.bashrc` / `.zshrc`:

`export NPM_TOKEN=github_access_token`

### How to run the application

Start all the containers

`make start`

### How to deploy

- Use changeset to update core package on github registry
- build images with github
- use make deploy to connect by ssh to server and update the stack
