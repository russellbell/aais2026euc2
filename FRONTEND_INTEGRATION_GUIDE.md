# Frontend AWS Integration Guide

## What's Been Integrated

### ✅ Authentication
- AWS Amplify configured
- Cognito User Pool login
- Sign up and email verification
- Logout functionality
- Auth guards on all routes

### ✅ API Integration
- API client service with automatic JWT token handling
- Real API calls for:
  - Get environments
  - Capture snapshots
  - Check drift
  - Freeze/unfreeze environments
  - Get audit log
- Graceful fallback to mock data on errors

### ✅ Components Updated
- `Login.jsx` - Full authentication UI
- `Header.jsx` - Logout button added
- `App.jsx` - Auth checking and routing
- `VaultContext.jsx` - API integration
- `EnvironmentCard.jsx` - Real API calls

## Files Created/Modified

### New Files
```
src/
├── config/
│   └── aws-config.js          # Amplify configuration
├── services/
│   └── apiClient.js            # API client with auth
└── components/
    └── Login.jsx               # Authentication UI
```

### Modified Files
```
src/
├── main.jsx                    # Amplify.configure()
├── App.jsx                     # Auth checking
├── context/VaultContext.jsx    # API integration
├── components/
│   ├── Header.jsx              # Logout button
│   └── EnvironmentCard.jsx     # Real API calls
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `aws-amplify` - AWS SDK for JavaScript
- `@aws-amplify/ui-react` - Pre-built UI components

### 2. Deploy AWS Infrastructure

```bash
cd infrastructure
./deploy.sh
```

This creates:
- `.env` file in project root (automatically)
- `aws-config.json` with all configuration

### 3. Create Test User

After deployment, create a test user:

```bash
# Get values from deployment output
USER_POOL_ID="<from output>"
CLIENT_ID="<from output>"

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

### 4. Start Development Server

```bash
npm run dev
```

### 5. Login

Navigate to `http://localhost:5173` and login with:
- **Username:** testuser
- **Password:** TestPassword123!

## How It Works

### Authentication Flow

```
1. User opens app
   ↓
2. App checks auth status (getCurrentUser)
   ↓
3a. If authenticated → Show boot sequence → Dashboard
3b. If not authenticated → Show login screen
   ↓
4. User logs in with Cognito
   ↓
5. JWT token stored in browser
   ↓
6. All API calls include token in Authorization header
```

### API Call Flow

```
1. Component calls VaultContext method (e.g., captureSnapshot)
   ↓
2. VaultContext calls apiClient method
   ↓
3. apiClient gets JWT token from Amplify
   ↓
4. apiClient makes API Gateway request with token
   ↓
5. API Gateway validates token with Cognito
   ↓
6. Lambda function executes
   ↓
7. Response returned to component
   ↓
8. UI updates with new data
```

### Graceful Degradation

If AWS services are unavailable:
- App falls back to mock data
- `[SIMULATION MODE]` badge appears in header
- All features still work with local state
- No errors shown to user

## Features

### ✅ Login Screen
- Sign in with username/password
- Sign up for new account
- Email verification
- Password requirements displayed
- Demo credentials shown
- Vault-Tec themed UI

### ✅ Real Snapshot Capture
- Sends SSM commands to EC2 instances
- Captures OS, packages, services, environment variables
- Stores in DynamoDB
- Updates UI automatically
- Falls back to simulation if no instance

### ✅ Real Drift Detection
- Compares current state vs snapshots
- Calculates drift score
- Categorizes by severity
- Stores drift events in DynamoDB

### ✅ Real Environment Management
- Freeze/unfreeze environments
- Updates status in real-time
- Audit trail for all actions
- Syncs with backend

### ✅ Logout
- Sign out button in header
- Clears session
- Redirects to login

## Testing

### Test Authentication
1. Open app
2. Should see login screen
3. Enter credentials
4. Should see boot sequence
5. Should see dashboard

### Test Snapshot Capture
1. Click `[SNAPSHOT]` on any environment
2. Watch terminal animation
3. Check that snapshot time updates
4. Verify in DynamoDB (AWS Console)

### Test Freeze Environment
1. Click `[FREEZE]` on ACTIVE environment
2. Confirm in modal
3. Environment should show FROZEN status
4. Check audit log for entry

### Test Logout
1. Click `[LOGOUT]` in header
2. Should return to login screen
3. Session should be cleared

## Environment Variables

The `.env` file is created automatically by `deploy.sh`:

```env
VITE_AWS_REGION=us-east-1
VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Important:** 
- `.env` is in `.gitignore` (don't commit it)
- Use `.env.example` as a template
- Values are loaded via `import.meta.env.VITE_*`

## Troubleshooting

### "User is not authenticated"
- Check that test user is created and confirmed
- Verify User Pool ID and Client ID in `.env`
- Try logging out and back in

### "Network Error" on API calls
- Verify API endpoint URL in `.env`
- Check that backend stack is deployed
- Verify JWT token is being sent (check Network tab)

### "Access Denied" errors
- Token may be expired (logout and login again)
- Verify Cognito authorizer is configured on API Gateway
- Check Lambda function permissions

### Login screen doesn't appear
- Check browser console for errors
- Verify Amplify is configured (check `main.jsx`)
- Check that `.env` file exists and has values

### Mock data still showing
- Check `[SIMULATION MODE]` badge in header
- If showing, API calls are failing
- Check browser console for error details
- Verify backend is deployed and accessible

## Code Examples

### Making an API Call

```javascript
import { useVault } from './context/VaultContext';

function MyComponent() {
  const { captureSnapshot, loading } = useVault();
  
  const handleCapture = async () => {
    try {
      await captureSnapshot('env-mariposa-07');
      console.log('Snapshot captured!');
    } catch (error) {
      console.error('Failed:', error);
    }
  };
  
  return (
    <button onClick={handleCapture} disabled={loading}>
      Capture Snapshot
    </button>
  );
}
```

### Checking Auth Status

```javascript
import { getCurrentUser } from 'aws-amplify/auth';

async function checkAuth() {
  try {
    const user = await getCurrentUser();
    console.log('Logged in as:', user.username);
  } catch {
    console.log('Not authenticated');
  }
}
```

### Manual API Call

```javascript
import apiClient from './services/apiClient';

async function getEnvironments() {
  try {
    const environments = await apiClient.getEnvironments();
    console.log('Environments:', environments);
  } catch (error) {
    console.error('API error:', error);
  }
}
```

## Next Steps

1. ✅ Authentication working
2. ✅ API integration complete
3. ✅ Real snapshot capture
4. ✅ Real drift detection
5. 🔄 Test with real EC2 instances
6. 🔄 Add more error handling
7. 🔄 Add loading states
8. 🔄 Optimize API calls

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify `.env` file has correct values
4. Check CloudWatch Logs for Lambda errors
5. Verify Cognito user is confirmed

## Summary

Your app now has:
- ✅ Full authentication with Cognito
- ✅ Real API integration with AWS
- ✅ Automatic JWT token handling
- ✅ Graceful fallback to mock data
- ✅ Logout functionality
- ✅ Production-ready architecture

Everything is wired up and ready to use!
