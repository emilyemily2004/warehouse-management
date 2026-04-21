# Mark targets as phony to avoid conflicts with files of the same name
.PHONY: install build test deploy-staging wait-db verify clean ci 

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	cd frontend && npm install	

# Build the application
build:
	@echo "Building application..."
	npm run build
	cd frontend && npm run build

# Run tests with coverage
test:
	@echo "Running tests with coverage..."
	npm test -- --coverage
	cd frontend && CI=true npm test -- --watchAll=false --coverage

# Deploy the full application
deploy-development:
	@echo "Deploying full application..."
	docker compose up --build -d

# Deploy in Staging Environment
deploy-staging:
	@echo "Deploying full application in staging mode..."
	docker compose -f docker-compose.staging.yml up --build -d

# Verify the deployment
verify:
	@echo "Verifying deployment..."
	docker compose ps
	docker compose logs postgres --tail=20

wait-db:
	@echo "Waiting for database..."
	sleep 10

# Clean up the environment
clean:
	@echo "Cleaning up environment..."
	docker compose down -v

# Run the full CI pipeline
ci: install build test deploy-staging wait-db verify
