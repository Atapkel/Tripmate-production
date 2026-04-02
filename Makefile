.PHONY: help build up down restart logs ssl renew clean ps

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build all containers
	docker compose build

up: ## Start all services
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

ssl: ## First-time SSL setup
	./init-ssl.sh

renew: ## Force renew SSL certificate
	docker compose run --rm certbot renew --force-renewal
	docker compose exec frontend nginx -s reload

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

shell-db: ## Open psql in database container
	docker compose exec db psql -U tripmate -d tripmate_db

migrate: ## Run database migrations
	docker compose exec backend alembic upgrade head

clean: ## Stop and remove all containers, volumes
	docker compose down -v
