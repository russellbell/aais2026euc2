# AWS Deployment - Quick Summary

## What I've Created

### Infrastructure Code (CDK Python)
```
infrastructure/
├── app.py                          # CDK app entry point
├── cdk.json                        # CDK configuration
├── requirements.txt                # Python dependencies
├── deploy.sh                       # Automated deployment script
├── README.md                       # Detailed documentation
├── stacks/
│   ├── backend_stack.py           # API, Lambda, DynamoDB, Cognito
│   └── demo_environment_stack.py  # EC2 instances with SSM
└── lambda/
    ├── get_environments/          # List environments
    ├── capture_snapshot/          # SSM snapshot capture
    ├── check_drift/               # Drift detection
    ├── freeze_environment/        # Freeze/unfreeze
    └── get_audit_log/             # Audit trail
```

## What Gets Deployed

### Backend Stack
- ✅ **API Gateway** - REST API with Cognito auth
- ✅ **5 Lambda Functions** - Python 3.11, serverless compute
- ✅ **4 DynamoDB Tables** - Environments, Snapshots, Drift, Audit
- ✅ **Cognito User Pool** - Authentication with email/password
- ✅ **IAM Roles** - Least-privilege permissions

### Demo Environment Stack
- ✅ **2 EC2 Instances** (t3.micro) - Lab Mariposa 07 & Lab West Tek 12
- ✅ **SSM Agent** - Remote management without SSH
- ✅ **Python + Packages** - NumPy, SciPy, Pandas pre-installed
- ✅ **Mock West Tek Packages** - Realistic demo data

## How to Deploy

### Option 1: Automated (Recommended)
```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

This script does everything:
- Checks prerequisites
- Sets up Python environment
- Bootstraps CDK
- Deploys both stacks
- Creates `.env` file for frontend
- Saves configuration to `aws-config.json`

### Option 2: Manual
```bash
cd infrastructure
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cdk bootstrap
cdk deploy --all
```

## After Deployment

### 1. Create Test User
```bash
# Get outputs from deployment
USER_POOL_ID="<from CDK output>"
CLIENT_ID="<from CDK output>"

# Sign up
aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username testuser \
  --password TestPassword123! \
  --user-attributes Name=email,Value=test@example.com

# Confirm user (admin command)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id $USER_POOL_ID \
  --username testuser
```

### 2. Frontend Configuration

The `.env` file is created automatically:
```env
VITE_AWS_REGION=us-east-1
VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Install Frontend Dependencies
```bash
npm install aws-amplify @aws-amplify/ui-react
```

## What Works

### ✅ Real Snapshot Capture
- Sends SSM commands to EC2 instances
- Captures OS, packages, services, environment variables
- Stores in DynamoDB
- Falls back to simulation if no instance

### ✅ Drift Detection
- Compares current state vs snapshots
- Calculates drift score (0-100)
- Categorizes by severity
- Stores drift events

### ✅ Authentication
- Cognito User Pool login
- JWT tokens for API
- Secure, scalable

### ✅ Audit Trail
- All actions logged
- Queryable by environment
- Immutable log

## Cost

**With EC2 running 24/7:** ~$17/month
**With EC2 stopped:** ~$2/month (Lambda, API, DynamoDB on free tier)

## Testing

### Test API
```bash
# Get token
TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=testuser,PASSWORD=TestPassword123! \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/environments
```

### Connect to EC2
```bash
# Get instance ID from outputs
aws ssm start-session --target i-xxxxxxxxxxxxxxxxx
```

## Cleanup

```bash
cd infrastructure
cdk destroy --all
```

## Next Steps

1. ✅ Deploy infrastructure (`./deploy.sh`)
2. ✅ Create test user
3. 🔄 Integrate frontend with AWS Amplify (I can help with this)
4. 🔄 Test snapshot capture on real EC2
5. 🔄 Demo drift detection

## Files to Review

- `AWS_DEPLOYMENT_PLAN.md` - Complete architecture and details
- `infrastructure/README.md` - Deployment documentation
- `infrastructure/stacks/backend_stack.py` - Backend infrastructure code
- `infrastructure/lambda/*/index.py` - Lambda function implementations

## Ready to Deploy?

Run this command when you're ready:
```bash
cd infrastructure && ./deploy.sh
```

It takes about 10 minutes to deploy everything.
