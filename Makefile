ifdef ENVIRONMENT
ENVIRONMENT := $(ENVIRONMENT)
else
ENVIRONMENT := local
endif

DOCKER_FILE_ENVIRONMENT := ./docker-compose-$(ENVIRONMENT).yml

ifdef HATHORA_TOKEN
HATHORA_TOKEN := $(HATHORA_TOKEN)
else
HATHORA_TOKEN := undefined
endif

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

build_repo_image:
	docker build -t composite-repo-image:latest -f Dockerfile.base .

build_services_image:
	docker compose -f ./docker-compose.yml -f $(DOCKER_FILE_ENVIRONMENT) build

build_packages:
	npm run build -w packages

build_database:
	docker-compose -f ./docker-compose.yml -f ./docker-compose-development.yml up -d db core_api
	$(SLEEP)
	docker exec composite_api /bin/sh -c "cd ./back; npx prisma migrate dev" 
	docker compose -f ./docker-compose.yml -f ./docker-compose-development.yml stop

build_database_staging:
	docker --context staging compose -f ./docker-compose.yml -f ./docker-compose-development.yml up -d db core_api cache
	$(SLEEP)
	docker --context staging exec composite-api-1 /bin/sh -c "cd ./back; npx prisma migrate dev" 
	docker --context staging compose -f ./docker-compose.yml -f ./docker-compose-development.yml stop

apply_migration_db:
	docker exec $(DOCKER_CONTAINER_NAME) npm run prisma:migrate:deploy

deploy:
	docker --context staging compose -f ./docker-compose.yml -f $(DOCKER_FILE_ENVIRONMENT) up -d

undeploy:
	docker --context staging compose -f ./docker-compose.yml -f $(DOCKER_FILE_ENVIRONMENT) down
# deploy_staging:
# 	docker --context staging stack deploy --compose-file docker-compose.yml --compose-file docker-compose-staging.yml composite

remove_staging:
	docker --context staging stack rm composite

deploy_real_time_api:
	cp ./back/Dockerfile.hathora ./back/Dockerfile && \
	cp ./back/Dockerfile.hathora.dockerignore ./back/.dockerignore && \
	tar -czf back.tar.gz --exclude='node_modules' --exclude='dist' --exclude='uploads' -C ./back . && \
	hathora-cloud deploy \
	--appId app-07e72471-d9d1-4b1c-bf21-74e2ad6cb53a \
	--file ./back.tar.gz \
	--roomsPerProcess 10 \
	--planName "tiny" \
	--transportType "tls" \
	--containerPort 3002 \
	--token $(HATHORA_TOKEN) && \
	rm ./back.tar.gz && rm ./back/Dockerfile && rm ./back/.dockerignore

build_real_time_api_image:
	docker build -f ./back/Dockerfile.hathora ./back
