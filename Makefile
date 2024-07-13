ifdef ENVIRONMENT
ENVIRONMENT := $(ENVIRONMENT)
else
ENVIRONMENT := local
endif
DOCKER_FILE_ENVIRONMENT := ./docker-compose-$(ENVIRONMENT).yml

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

# print:
# 	@echo $(DOCKER_FILE_ENVIRONMENT)

start:
	docker compose -f ./docker-compose.yml -f $(DOCKER_FILE_ENVIRONMENT) up

stop:
	docker compose -f ./docker-compose.yml -f $(DOCKER_FILE_ENVIRONMENT) down

build_containers:
	docker compose -f ./docker-compose.yml -f $(DOCKER_FILE_ENVIRONMENT) build

build_packages:
	npm run build -w packages

build_database:
	docker-compose -f ./docker-compose.yml -f ./docker-compose-development.yml up -d db api
	$(SLEEP)
	docker exec composite_api /bin/sh -c "cd ./back; npx prisma migrate dev" 
	docker compose -f ./docker-compose.yml -f ./docker-compose-development.yml stop


deploy:
	docker --context staging compose -f ./docker-compose.yml -f $(DOCKER_FILE_ENVIRONMENT) up -d
