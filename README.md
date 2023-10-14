# Composite - 3D coop platformer on the web

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
