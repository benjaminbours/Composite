ENVIRONMENT := development
# DOCKER_FILE_ENVIRONMENT := 
# ifneq ($(ENVIRONMENT), development)
DOCKER_FILE_ENVIRONMENT := -f ./docker-compose-$(ENVIRONMENT).yml
# endif

ifeq ($(OS),Windows_NT)
		SLEEP = timeout /T 3 >NUL
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		SLEEP = sleep 3
	endif
	ifeq ($(UNAME_S),Darwin)
		SLEEP = sleep 3
	endif
endif

start:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) up

stop:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) down

build_containers:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) build

build_packages:
	npm run build -w packages

build_database:
	docker-compose -f ./docker-compose.yml -f ./docker-compose-development.yml up -d db api
	$(SLEEP)
	docker exec composite_api /bin/sh -c "cd ./back; npx prisma migrate dev" 
	docker-compose -f ./docker-compose.yml -f ./docker-compose-development.yml stop

deploy:
	docker --context staging stack deploy --compose-file docker-compose.yml --compose-file docker-compose-staging.yml composite
# docker-compose --context $(ENVIRONMENT) -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) up -d
