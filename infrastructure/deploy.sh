#!/bin/bash

set -e

echo "🚀 West Tek Vault Control - AWS Deployment"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK not found. Installing..."
    npm install -g aws-cdk
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install it first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup Python virtual environment
echo "🐍 Setting up Python environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "✅ Python environment ready"
echo ""

# Bootstrap CDK (if needed)
echo "🔧 Checking CDK bootstrap..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit &> /dev/null; then
    echo "Bootstrapping CDK..."
    cdk bootstrap
else
    echo "✅ CDK already bootstrapped"
fi
echo ""

# Deploy stacks
echo "🚀 Deploying infrastructure..."
echo ""

cdk deploy --all --require-approval never

echo ""
echo "✅ Deployment complete!"
echo ""

# Get outputs
echo "📝 Stack Outputs:"
echo "=================="
aws cloudformation describe-stacks \
    --stack-name WestTekBackendStack \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

echo ""
echo "💾 Saving configuration to ../aws-config.json..."

# Extract outputs and save to JSON
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name WestTekBackendStack --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name WestTekBackendStack --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' --output text)
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name WestTekBackendStack --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' --output text)
IDENTITY_POOL_ID=$(aws cloudformation describe-stacks --stack-name WestTekBackendStack --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' --output text)
REGION=$(aws cloudformation describe-stacks --stack-name WestTekBackendStack --query 'Stacks[0].Outputs[?OutputKey==`Region`].OutputValue' --output text)

cat > ../aws-config.json <<EOF
{
  "region": "$REGION",
  "apiEndpoint": "$API_ENDPOINT",
  "userPoolId": "$USER_POOL_ID",
  "userPoolClientId": "$USER_POOL_CLIENT_ID",
  "identityPoolId": "$IDENTITY_POOL_ID"
}
EOF

echo "✅ Configuration saved"
echo ""

# Create .env file for frontend
echo "📝 Creating .env file for frontend..."
cat > ../.env <<EOF
VITE_AWS_REGION=$REGION
VITE_API_ENDPOINT=$API_ENDPOINT
VITE_USER_POOL_ID=$USER_POOL_ID
VITE_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
VITE_IDENTITY_POOL_ID=$IDENTITY_POOL_ID
EOF

echo "✅ .env file created"
echo ""

echo "🎉 Deployment successful!"
echo ""
echo "Next steps:"
echo "1. Create a test user:"
echo "   aws cognito-idp sign-up --client-id $USER_POOL_CLIENT_ID --username testuser --password TestPassword123! --user-attributes Name=email,Value=test@example.com"
echo "   aws cognito-idp admin-confirm-sign-up --user-pool-id $USER_POOL_ID --username testuser"
echo ""
echo "2. Start your React app:"
echo "   npm run dev"
echo ""
echo "3. Login with:"
echo "   Username: testuser"
echo "   Password: TestPassword123!"
echo ""
