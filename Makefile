.PHONY: help build up down restart logs renew clean ps \
	up-local build-local down-local logs-local ps-local shell-db-local \
	shell-backend-local clean-local

COMPOSE_LOCAL := docker compose -f docker-compose.local.yml

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build all containers
	docker compose build

up: ## Start all services (SSL is automatic on first run)
	docker compose up -d

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose down
	docker compose up -d

logs: ## Follow logs (all services)
	docker compose logs -f

logs-backend: ## Follow backend logs
	docker compose logs -f backend

logs-frontend: ## Follow frontend logs
	docker compose logs -f frontend

ps: ## Show running containers
	docker compose ps

renew: ## Force renew SSL certificate
	docker compose run --rm --entrypoint "" certbot certbot renew --force-renewal
	docker compose exec frontend nginx -s reload

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

shell-db: ## Open psql in database container
	docker compose exec db psql -U tripmate -d tripmate_db

migrate: ## Run database migrations
	docker compose exec backend alembic upgrade head

clean: ## Stop and remove all containers, volumes
	docker compose down -v

# --- Local stack (docker-compose.local.yml): db, redis, backend :8000, frontend :8080

up-local: ## Build (if needed) and start full local stack in Docker
	$(COMPOSE_LOCAL) up -d --build

build-local: ## Build images for local stack only
	$(COMPOSE_LOCAL) build

down-local: ## Stop local stack
	$(COMPOSE_LOCAL) down

logs-local: ## Follow logs (local stack)
	$(COMPOSE_LOCAL) logs -f

ps-local: ## Show local stack containers
	$(COMPOSE_LOCAL) ps

shell-db-local: ## psql into local Postgres (default user/db from compose)
	$(COMPOSE_LOCAL) exec db psql -U tripmate -d tripmate_db

shell-backend-local: ## Shell in local backend container
	$(COMPOSE_LOCAL) exec backend bash

clean-local: ## Stop local stack and remove its volumes
	$(COMPOSE_LOCAL) down -v