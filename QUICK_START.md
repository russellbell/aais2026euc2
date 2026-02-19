# Quick Start Guide

## 🚀 Deploy in 3 Steps

### Step 1: Deploy AWS Infrastructure
```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```
⏱️ ~10 minutes

### Step 2: Create Test User
```bash
# Copy these values from deployment output
USER_POOL_ID="<from output>"
CLIENT_ID="<from output>"

# Run these commands
aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username testuser \
  --password TestPassword123! \
  --user-attributes Name=email,Value=test@example.com

aws cognito-idp admin-confirm-sign-up \
  --user-pool-id $USER_POOL_ID \
  --username testuser
```

### Step 3: Start App
```bash
cd ..
npm install
npm run dev
```

## 🔑 Login Credentials

- **Username:** testuser
- **Password:** TestPassword123!

## ✅ What You Get

- Full authentication with Cognito
- Real API backend with Lambda + DynamoDB
- 2 EC2 demo instances with SSM
- Snapshot capture via SSM commands
- Drift detection and scoring
- Complete audit trail
- Immersive Vault-Tec UI

## 📁 Key Files

- `.env` - Auto-created with AWS config
- `infrastructure/deploy.sh` - One-command deployment
- `src/components/Login.jsx` - Authentication UI
- `src/services/apiClient.js` - API client
- `src/context/VaultContext.jsx` - API integration

## 💰 Cost

- **With EC2:** ~$17/month
- **Without EC2:** ~$2/month

## 🧹 Cleanup

```bash
cd infrastructure
cdk destroy --all
```

## 📚 Documentation

- `INTEGRATION_COMPLETE.md` - Full overview
- `AWS_DEPLOYMENT_PLAN.md` - Architecture details
- `FRONTEND_INTEGRATION_GUIDE.md` - Integration guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

## 🎯 Demo Flow

1. Login → Boot sequence
2. View environments
3. Capture snapshot
4. Freeze environment
5. Check drift monitor
6. Run demo mode
7. View audit log

## ❓ Troubleshooting

**Can't login?**
- Verify user is confirmed
- Check `.env` file exists

**API errors?**
- Check backend is deployed
- Verify API endpoint in `.env`

**Simulation mode?**
- Backend not reachable
- Check CloudWatch Logs

## 🎉 Success!

When you see:
- Login screen with Vault-Tec theme
- Boot sequence animation
- Environment cards loading
- Snapshot capture working
- Audit log updating

You're ready to demo! 🚀
