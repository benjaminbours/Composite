start:
	docker-compose up

build:
	docker-compose build

build_workspace:
	docker build -t composite-workspace .

# initial_db_setup:
# 	docker exec hitech_api npx prisma migrate deploy

# display_api_logs:
# 	docker logs -f hitech_api