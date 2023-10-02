ENVIRONMENT := development
# DOCKER_FILE_ENVIRONMENT := 
# ifneq ($(ENVIRONMENT), development)
DOCKER_FILE_ENVIRONMENT := -f ./docker-compose-$(ENVIRONMENT).yml
# endif

start:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) up

build:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) build

build_workspace:
	docker buildx use mybuilder && docker buildx build --platform linux/amd64,linux/arm64 -t boursbenjamin/composite-workspace:latest --push .

push_workspace:
	docker push boursbenjamin/composite-workspace:latest

deploy:
	docker --context staging stack deploy --compose-file docker-compose.yml --compose-file docker-compose-staging.yml composite
# docker-compose --context $(ENVIRONMENT) -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) up -d
