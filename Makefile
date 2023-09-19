start:
	docker-compose up

build:
	docker-compose build

# start_db:
# 	docker-compose up -d db adminer cache

# initial_db_setup:
# 	docker exec hitech_api npx prisma migrate deploy

# display_api_logs:
# 	docker logs -f hitech_api