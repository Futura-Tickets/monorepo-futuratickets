#!/bin/bash

# Configure Slack Webhook for AlertManager
# This script helps you configure the Slack webhook for production monitoring alerts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
K8S_DIR="$PROJECT_ROOT/k8s/alertmanager"

echo "========================================"
echo "  Slack Webhook Configuration Setup"
echo "========================================"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed"
    echo "   Please install kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if we have cluster access
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "   Please configure kubectl to connect to your cluster"
    exit 1
fi

echo "✅ Connected to Kubernetes cluster"
echo ""

# Check if namespace exists
if ! kubectl get namespace futuratickets &> /dev/null; then
    echo "📦 Creating namespace 'futuratickets'..."
    kubectl create namespace futuratickets
    echo "✅ Namespace created"
else
    echo "✅ Namespace 'futuratickets' already exists"
fi
echo ""

# Prompt for Slack Webhook URL
echo "📝 Slack Webhook Configuration"
echo "--------------------------------"
echo ""
echo "To get your Slack Webhook URL:"
echo "1. Go to https://api.slack.com/apps"
echo "2. Create a new app or select existing app"
echo "3. Enable 'Incoming Webhooks'"
echo "4. Add New Webhook to Workspace"
echo "5. Copy the Webhook URL"
echo ""

read -p "Enter your Slack Webhook URL: " WEBHOOK_URL

if [ -z "$WEBHOOK_URL" ]; then
    echo "❌ Webhook URL cannot be empty"
    exit 1
fi

# Validate webhook URL format
if [[ ! "$WEBHOOK_URL" =~ ^https://hooks\.slack\.com/services/ ]]; then
    echo "⚠️  Warning: URL doesn't match expected Slack webhook format"
    echo "   Expected format: https://hooks.slack.com/services/..."
    read -p "   Continue anyway? (y/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

echo ""
echo "🔐 Creating Kubernetes secret..."

# Create secret (will replace if exists)
kubectl create secret generic alertmanager-slack-webhook \
    --from-literal=webhook-url="$WEBHOOK_URL" \
    --namespace=futuratickets \
    --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secret created successfully"
echo ""

# Check if AlertManager is deployed
if kubectl get deployment alertmanager -n futuratickets &> /dev/null; then
    echo "🔄 Restarting AlertManager to apply new configuration..."
    kubectl rollout restart deployment/alertmanager -n futuratickets

    echo "⏳ Waiting for AlertManager to be ready..."
    kubectl rollout status deployment/alertmanager -n futuratickets --timeout=120s

    echo "✅ AlertManager restarted successfully"
else
    echo "ℹ️  AlertManager not yet deployed"
    echo "   Run: ./scripts/deploy-monitoring.sh"
fi

echo ""
echo "========================================"
echo "  ✅ Slack Webhook Configured!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Create the following Slack channels:"
echo "   • #alerts-critical  (for critical system alerts)"
echo "   • #alerts-warnings  (for warning alerts)"
echo "   • #business-alerts  (for business metrics)"
echo "   • #payments-alerts  (for payment system alerts)"
echo ""
echo "2. Deploy the monitoring stack:"
echo "   ./scripts/deploy-monitoring.sh"
echo ""
echo "3. Test alerts:"
echo "   kubectl port-forward svc/alertmanager -n futuratickets 9093:9093"
echo "   Open http://localhost:9093"
echo ""
