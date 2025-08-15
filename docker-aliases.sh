#!/bin/bash

# CapitolScope Docker Aliases
# Source this file in your ~/.bashrc or ~/.zshrc: source /path/to/docker-aliases.sh

# Build and run containers with file watching enabled and show logs
alias capitol-build='docker compose -p capitolscope up --build -d && docker compose -p capitolscope logs -f'

# Deploy frontend to Cloud Run
alias capitol-deploy-frontend='./scripts/gcloud/deploy_frontend_cloud_run.sh'

# Deploy backend to Cloud Run
alias capitol-deploy-backend='./scripts/gcloud/deploy_backend_cloud_run.sh'

# Update environment variables in Cloud Run
alias capitol-update-env='./scripts/gcloud/update_cloud_run_env_simple_final.sh'

# Display logs for running containers
alias capitol-logs='docker compose -p capitolscope logs -f'

# Stop all containers
alias capitol-stop='docker compose -p capitolscope down'

# Restart just the main app container
alias capitol-restart='docker compose -p capitolscope restart capitolscope'

# Execute bash in the running container
alias capitol-shell='docker compose -p capitolscope exec capitolscope bash'

# Run database migrations
alias capitol-migrate='docker compose -p capitolscope exec capitolscope python -m alembic upgrade head'

# View only app logs
alias capitol-app-logs='docker compose -p capitolscope logs -f capitolscope'

# View only worker logs  
alias capitol-worker-logs='docker compose -p capitolscope logs -f worker'

echo "CapitolScope Docker aliases loaded:"
echo "  capitol-build           - Build and run with file watching"
echo "  capitol-deploy-frontend - Deploy frontend to Cloud Run"
echo "  capitol-deploy-backend  - Deploy backend to Cloud Run"
echo "  capitol-update-env      - Update environment variables in Cloud Run"
echo "  capitol-logs            - Show all container logs"
echo "  capitol-app-logs        - Show only app logs"
echo "  capitol-worker-logs     - Show only worker logs
echo "  capitol-stop            - Stop all containers"
echo "  capitol-restart         - Restart main app"
echo "  capitol-shell           - Open shell in container"
echo "  capitol-migrate         - Run database migrations"
" 


