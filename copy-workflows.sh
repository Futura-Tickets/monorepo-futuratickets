#!/bin/bash

# Script to copy and customize workflows for all 3 APIs

TEMPLATE_DIR="/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-access-api/scripts/github-workflows"

# Define API configurations
declare -A APIS=(
  ["futura-market-place-api"]="Marketplace API|marketplace-api|https://marketplace-api"
  ["futura-access-api"]="Access API|access-api|https://access-api"
)

# Copy workflows for each API
for api_dir in "${!APIS[@]}"; do
  IFS='|' read -r api_name image_name base_url <<< "${APIS[$api_dir]}"
  
  echo "Processing $api_name..."
  
  TARGET_DIR="/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/$api_dir/.github/workflows"
  mkdir -p "$TARGET_DIR"
  
  # Copy and customize each workflow file
  for workflow in ci.yml deploy-staging.yml deploy-production.yml security-scan.yml; do
    if [ -f "$TEMPLATE_DIR/$workflow" ]; then
      echo "  - Copying $workflow..."
      
      # Use sed to replace placeholders
      sed -e "s/futura-access-api/$api_dir/g" \
          -e "s/Access API/$api_name/g" \
          -e "s/access-api/$image_name/g" \
          -e "s|https://api|$base_url|g" \
          "$TEMPLATE_DIR/$workflow" > "$TARGET_DIR/$workflow"
    fi
  done
done

echo "✅ Workflow copy complete!"
