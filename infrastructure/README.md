# West Tek Vault Control - AWS Infrastructure

This directory contains the AWS CDK infrastructure code for deploying the West Tek Vault Control backend.

## Architecture

- **API Gateway**: REST API with Cognito authentication
- **Lambda Functions**: 5 functions for environment management
- **DynamoDB**: 4 tables for data storage
- **Cognito**: User Pool for authentication
- **EC2**: 2 demo lab instances with SSM
- **IAM**: Roles and policies for secure access

## Prerequisites

1. **AWS CLI** configured with credentials
2. **Python 3.9+** installed
3. **Node.js 18+** (for CDK)
4. **AWS CDK** installed globally:
   ```bash
   npm install -g aws-cdk
   ```

## Deployment Steps

### 1. Install Dependencies

```bash
cd infrastructure
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap
```

### 3. Deploy Infrastructure

```bash
# Deploy backend stack (API, Lambda, DynamoDB, Cognito)
cdk deploy WestTekBackendStack

# Deploy demo environments (EC2 instances)
cdk deploy WestTekDemoEnvironmentStack

# Or deploy both at once
cdk deploy --all
```

### 4. Get Outputs

After deployment, CDK will output important values:

```
Outputs:
WestTekBackendStack.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
WestTekBackendStack.UserPoolId = us-east-1_xxxxxxxxx
WestTekBackendStack.UserPoolClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
WestTekBackendStack.IdentityPoolId = us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
WestTekBackendStack.Region = us-east-1
```

**Save these values** - you'll need them for frontend configuration.

### 5. Create Test User

```bash
aws cognito-idp sign-up \
  --client-id <UserPoolClientId> \
  --username testuser \
  --password TestPassword123! \
  --user-attributes Name=email,Value=test@example.com

# Confirm the user (admin command)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id <UserPoolId> \
  --username testuser
```

## Frontend Configuration

Create a `.env` file in your React app root:

```env
VITE_AWS_REGION=us-east-1
VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Stack Details

### Backend Stack

**Lambda Functions:**
- `GetEnvironmentsFunction` - List all environments
- `CaptureSnapshotFunction` - Capture environment snapshot via SSM
- `CheckDriftFunction` - Check for configuration drift
- `FreezeEnvironmentFunction` - Freeze/unfreeze environments
- `GetAuditLogFunction` - Retrieve audit trail

**DynamoDB Tables:**
- `EnvironmentsTable` - Environment metadata
- `SnapshotsTable` - Captured snapshots
- `DriftEventsTable` - Detected drift events
- `AuditLogTable` - Audit trail

**API Endpoints:**
- `GET /environments` - List environments
- `POST /environments/{id}/snapshot` - Capture snapshot
- `GET /environments/{id}/drift` - Get drift status
- `POST /environments/{id}/freeze` - Freeze environment
- `GET /audit-log` - Get audit log

### Demo Environment Stack

**VPC:**
- Dedicated VPC across 2 Availability Zones
- Public subnets (24-bit CIDR)
- Private subnets with NAT Gateway (24-bit CIDR)
- VPC Endpoints for SSM (reduces data transfer costs)

**EC2 Instances:**
- Lab Mariposa 07 (t3.micro) - FROZEN environment
- Lab West Tek 12 (t3.micro) - ACTIVE environment

Both instances have:
- SSM Agent for remote management
- Python 3 with scientific packages (numpy, scipy, pandas)
- Docker installed
- Mock West Tek packages

## Testing

### Test API Endpoints

```bash
# Get auth token first
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <UserPoolClientId> \
  --auth-parameters USERNAME=testuser,PASSWORD=TestPassword123!

# Use the IdToken from response
export TOKEN="<IdToken>"

# Test get environments
curl -H "Authorization: Bearer $TOKEN" \
  https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/environments

# Test capture snapshot
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/environments/env-mariposa-07/snapshot
```

### Connect to EC2 via SSM

```bash
# Get instance ID from stack outputs
aws ssm start-session --target <InstanceId>
```

## Cost Estimate

**Daily costs (approximate):**
- Lambda: ~$0.20 (free tier eligible)
- API Gateway: ~$0.50 (free tier eligible)
- DynamoDB: ~$0.25 (free tier eligible)
- VPC: $0.00
- NAT Gateway: ~$1.10/day
- VPC Endpoints: ~$0.72/day
- EC2 (2x t3.micro): ~$0.50/day
- **Total: ~$3/day or ~$70/month**

**To reduce costs:**
- Stop EC2 instances when not in use
- Delete entire stack when done with demo
- NAT Gateway and VPC Endpoints are the main costs

## Cleanup

To avoid ongoing charges:

```bash
# Destroy all resources
cdk destroy --all

# Or destroy individually
cdk destroy WestTekDemoEnvironmentStack
cdk destroy WestTekBackendStack
```

## Troubleshooting

### Lambda Timeout
If snapshot capture times out, increase timeout in `backend_stack.py`:
```python
timeout=Duration.seconds(300)  # Increase if needed
```

### SSM Connection Issues
Ensure EC2 instances have:
- SSM Agent running
- Proper IAM role attached
- Outbound internet access

### Cognito Authentication
If auth fails:
- Verify user is confirmed
- Check client ID matches
- Ensure password meets requirements

## Development

### Update Lambda Code

After modifying Lambda functions:
```bash
cdk deploy WestTekBackendStack
```

### View Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/WestTekBackendStack-CaptureSnapshotFunction --follow

# API Gateway logs
aws logs tail API-Gateway-Execution-Logs_<api-id>/prod --follow
```

## Security Notes

- All API endpoints require Cognito authentication
- Lambda functions use least-privilege IAM roles
- DynamoDB tables have point-in-time recovery enabled
- EC2 instances use SSM Session Manager (no SSH keys needed)
- No sensitive data stored in code or environment variables

## Support

For issues or questions:
1. Check CloudWatch Logs for Lambda errors
2. Verify IAM permissions
3. Ensure all prerequisites are met
4. Review CDK synthesis output: `cdk synth`
