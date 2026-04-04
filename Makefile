.PHONY: help build up down restart logs renew clean ps \
	up-local build-local down-local logs-local ps-local shell-db-local \
	shell-backend-local clean-local up-local-api up-local-dev down-local-dev \
	dev-frontend dev-backend-host

COMPOSE_LOCAL := docker compose -f docker-compose.local.yml
COMPOSE_LOCAL_DEV := docker compose -f docker-compose.local.yml -f docker-compose.local.dev.yml

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
#
# Fast iteration (hot reload UI + API):
#   make up-local-dev     # db + redis + backend with uvicorn --reload
#   make dev-frontend     # http://localhost:5173 — Vite HMR, /api → :8000
#
# Backend-only reload in Docker (same as up-local-dev for API); without dev overlay:
#   make up-local-api     # db + redis + backend (rebuild image to pick up Python changes)

up-local-api: ## DB + Redis + backend (no reload; rebuild image after code changes)
	$(COMPOSE_LOCAL) up -d db redis backend

up-local-dev: ## DB + Redis + backend with --reload (Python changes apply without rebuild)
	$(COMPOSE_LOCAL_DEV) up -d db redis backend

down-local-dev: ## Stop stack started with up-local-dev (same compose files)
	$(COMPOSE_LOCAL_DEV) down

dev-frontend: ## Vite dev server with instant reload at http://localhost:5173
	cd frontend && npm run dev

dev-backend-host: ## Run API with --reload on the host (needs DB+Redis up; set DB_HOST/REDIS_HOST to 127.0.0.1)
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

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