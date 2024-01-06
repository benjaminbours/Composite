ENVIRONMENT := development
# DOCKER_FILE_ENVIRONMENT := 
# ifneq ($(ENVIRONMENT), development)
DOCKER_FILE_ENVIRONMENT := -f ./docker-compose-$(ENVIRONMENT).yml
# endif

start:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) up

stop:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) down

build_containers:
	docker-compose -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) build

build_packages:
	npm run build -w packages

build_database:
	docker exec composite_api cd /back && npx prisma migrate dev 

deploy:
	docker --context staging stack deploy --compose-file docker-compose.yml --compose-file docker-compose-staging.yml composite
# docker-compose --context $(ENVIRONMENT) -f ./docker-compose.yml $(DOCKER_FILE_ENVIRONMENT) up -d
