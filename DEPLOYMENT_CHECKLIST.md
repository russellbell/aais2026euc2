# AWS Deployment Checklist

## Pre-Deployment

- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] AWS CDK installed (`npm install -g aws-cdk`)
- [ ] Python 3.9+ installed (`python3 --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] AWS account has sufficient permissions (Administrator or equivalent)
- [ ] Reviewed cost estimate (~$17/month with EC2, ~$2/month without)

## Deployment Steps

- [ ] Navigate to infrastructure directory (`cd infrastructure`)
- [ ] Make deploy script executable (`chmod +x deploy.sh`)
- [ ] Run deployment script (`./deploy.sh`)
- [ ] Wait for deployment to complete (~10 minutes)
- [ ] Verify outputs are displayed
- [ ] Check that `.env` file was created in project root
- [ ] Check that `aws-config.json` was created

## Post-Deployment Configuration

- [ ] Copy User Pool ID from outputs
- [ ] Copy User Pool Client ID from outputs
- [ ] Create test user:
  ```bash
  aws cognito-idp sign-up \
    --client-id <CLIENT_ID> \
    --username testuser \
    --password TestPassword123! \
    --user-attributes Name=email,Value=test@example.com
  ```
- [ ] Confirm test user:
  ```bash
  aws cognito-idp admin-confirm-sign-up \
    --user-pool-id <USER_POOL_ID> \
    --username testuser
  ```

## Frontend Integration

- [ ] Install AWS Amplify (`npm install aws-amplify @aws-amplify/ui-react`)
- [ ] Verify `.env` file exists in project root
- [ ] Configure Amplify in `src/main.jsx`
- [ ] Create Login component
- [ ] Create API client service
- [ ] Update VaultContext to use real API
- [ ] Test login flow
- [ ] Test API calls

## Testing

- [ ] Test authentication (login with testuser/TestPassword123!)
- [ ] Test GET /environments endpoint
- [ ] Test POST /environments/{id}/snapshot
- [ ] Test GET /environments/{id}/drift
- [ ] Test POST /environments/{id}/freeze
- [ ] Test GET /audit-log
- [ ] Connect to EC2 via SSM (`aws ssm start-session --target <INSTANCE_ID>`)
- [ ] Verify SSM commands work on EC2
- [ ] Test snapshot capture on real instance
- [ ] Verify data appears in DynamoDB

## Verification

- [ ] Check CloudWatch Logs for Lambda functions
- [ ] Verify DynamoDB tables have data
- [ ] Check API Gateway logs
- [ ] Verify Cognito User Pool has test user
- [ ] Test frontend login flow
- [ ] Test snapshot capture from UI
- [ ] Test freeze environment from UI
- [ ] Verify audit log updates

## Optional: Stop EC2 to Save Costs

If not actively demoing:
- [ ] Stop Lab Mariposa 07 instance
- [ ] Stop Lab West Tek 12 instance
- [ ] Note: Snapshot capture will fall back to simulation mode

To stop instances:
```bash
aws ec2 stop-instances --instance-ids <INSTANCE_ID_1> <INSTANCE_ID_2>
```

To start instances:
```bash
aws ec2 start-instances --instance-ids <INSTANCE_ID_1> <INSTANCE_ID_2>
```

## Troubleshooting

If deployment fails:
- [ ] Check AWS CLI credentials (`aws sts get-caller-identity`)
- [ ] Verify CDK is bootstrapped (`aws cloudformation describe-stacks --stack-name CDKToolkit`)
- [ ] Check CloudFormation console for error details
- [ ] Review CDK synthesis output (`cdk synth`)
- [ ] Check Lambda function logs in CloudWatch

If authentication fails:
- [ ] Verify user is confirmed in Cognito console
- [ ] Check User Pool Client ID matches `.env`
- [ ] Verify password meets requirements
- [ ] Check token expiration

If API calls fail:
- [ ] Verify token is included in Authorization header
- [ ] Check API Gateway endpoint URL
- [ ] Review API Gateway logs in CloudWatch
- [ ] Verify Lambda function permissions

## Cleanup (When Done)

To remove all resources:
- [ ] Run `cd infrastructure && cdk destroy --all`
- [ ] Confirm deletion when prompted
- [ ] Verify all stacks are deleted in CloudFormation console
- [ ] Check that DynamoDB tables are deleted
- [ ] Verify EC2 instances are terminated
- [ ] Confirm Cognito User Pool is deleted

## Success Criteria

✅ Deployment complete when:
- Both CDK stacks deployed successfully
- Test user created and confirmed
- `.env` file exists with all values
- Can login to frontend with test user
- Can capture snapshot via UI
- Can freeze environment via UI
- Audit log shows all actions
- EC2 instances are running and accessible via SSM

## Estimated Timeline

- Pre-deployment setup: 5 minutes
- CDK deployment: 10 minutes
- User creation: 2 minutes
- Frontend integration: 30 minutes
- Testing: 15 minutes
- **Total: ~1 hour**

## Support Resources

- AWS CDK Documentation: https://docs.aws.amazon.com/cdk/
- AWS Amplify Documentation: https://docs.amplify.aws/
- Cognito Documentation: https://docs.aws.amazon.com/cognito/
- SSM Documentation: https://docs.aws.amazon.com/systems-manager/

## Notes

- Keep your User Pool ID and Client ID secure
- Don't commit `.env` file to git (already in .gitignore)
- EC2 instances cost ~$0.50/day when running
- Lambda/API/DynamoDB are mostly free tier eligible
- SSM Session Manager requires no SSH keys
- All API calls require valid JWT token
