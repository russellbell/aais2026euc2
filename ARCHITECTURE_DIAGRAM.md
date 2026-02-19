# West Tek Vault Control - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    React Application (Vite)                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │    │
│  │  │ Environment  │  │ Drift Monitor│  │  AI Drift Assistant ⭐   │ │    │
│  │  │   Cards      │  │   & Alerts   │  │  (Chat + Remediation)    │ │    │
│  │  │ + Delete 🆕  │  │ + Resolve 🆕 │  │  - Code blocks           │ │    │
│  │  └──────────────┘  └──────────────┘  │  - Copy commands         │ │    │
│  │  ┌──────────────┐  ┌──────────────┐  └──────────────────────────┘ │    │
│  │  │  Snapshot    │  │  Vault Log   │  ┌──────────────────────────┐ │    │
│  │  │  Terminal    │  │  (Audit)     │  │  Onboarding Wizard 🆕    │ │    │
│  │  │              │  │              │  │  (Create Environments)   │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │    │
│  │  │ Freeze Modal │  │ Delete Modal │  │  Drift Notifications 🆕  │ │    │
│  │  │              │  │  🆕          │  │  (SNS Integration)       │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Hosted on: AWS Amplify Hosting                                             │
│  URL: https://main.dwduem93g3gna.amplifyapp.com                             │
│  Branding: WestTek Research Labs (Fallout-inspired theme)                   │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               │ HTTPS (AWS Amplify SDK)
                               │ Authentication: Cognito JWT Tokens
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                         AUTHENTICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐         ┌──────────────────────────────────────┐  │
│  │  Cognito User Pool  │────────▶│  Cognito Identity Pool               │  │
│  │  - User Management  │         │  - Federated Identities              │  │
│  │  - JWT Tokens       │         │  - IAM Role Assignment               │  │
│  └─────────────────────┘         └──────────────────────────────────────┘  │
│                                              │                               │
│                                              │ Assumes Role                  │
│                                              ▼                               │
│                                   ┌──────────────────────┐                  │
│                                   │ Authenticated Role   │                  │
│                                   │ - execute-api:Invoke │                  │
│                                   └──────────────────────┘                  │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               │ Authorized API Calls
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                            API GATEWAY LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  REST API: https://k0h0q7yvxe.execute-api.us-east-1.amazonaws.com/prod/    │
│                                                                              │
│  Endpoints:                                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  GET    /environments                    → Get all environments    │    │
│  │  POST   /environments/{id}/snapshot      → Capture snapshot        │    │
│  │  POST   /environments/{id}/freeze        → Freeze/unfreeze env     │    │
│  │  GET    /environments/{id}/drift         → Check drift             │    │
│  │  POST   /environments/{id}/analyze-drift → AI drift analysis ⭐    │    │
│  │  POST   /alerts                          → Subscribe to alerts 🆕  │    │
│  │  GET    /audit-log                       → Get audit log           │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Authorization: Cognito User Pool Authorizer                                │
│  CORS: Enabled for Amplify domain                                           │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               │ Lambda Integrations
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                          LAMBDA FUNCTIONS LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │ get_environments     │  │ capture_snapshot     │  │ freeze_environment│ │
│  │ - List all envs      │  │ - Create snapshot    │  │ - Freeze/unfreeze│ │
│  │ - Auto-init demo data│  │ - Call AI for desc ⭐│  │ - Update status  │ │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘ │
│                                      │                                       │
│  ┌──────────────────────┐           │ Invokes                               │
│  │ check_drift          │           ▼                                       │
│  │ - Compare snapshots  │  ┌──────────────────────────────────────────┐   │
│  │ - Calculate score    │  │ generate_snapshot_description ⭐         │   │
│  │ - Auto-init demo data│  │ - Bedrock Claude 3 Haiku                 │   │
│  │ - Trigger SNS 🆕     │  │ - AI-generated descriptions              │   │
│  └──────────────────────┘  └──────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────────────────┐   │
│  │ get_audit_log        │  │ analyze_drift_ai ⭐🆕                    │   │
│  │ - Fetch audit entries│  │ - Bedrock Claude 3 Haiku                 │   │
│  │ - Auto-init demo data│  │ - Analyze drift patterns                 │   │
│  └──────────────────────┘  │ - Root cause analysis                    │   │
│                             │ - Shell command remediation              │   │
│  ┌──────────────────────┐  │ - WestTek personality                    │   │
│  │ subscribe_alerts 🆕  │  └──────────────────────────────────────────┘   │
│  │ - Manage SNS subs    │                                                   │
│  │ - Email/SMS alerts   │  ┌──────────────────────────────────────────┐   │
│  └──────────────────────┘  │ send_drift_notification 🆕               │   │
│                             │ - Triggered by drift detection           │   │
│                             │ - Publishes to SNS topic                 │   │
│                             │ - Email/SMS notifications                │   │
│                             └──────────────────────────────────────────┘   │
│                                                                              │
│  Runtime: Python 3.11                                                        │
│  IAM Role: Lambda Execution Role with DynamoDB, Bedrock, Lambda, SNS perms  │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               │ Read/Write Operations
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                          DATABASE LAYER (DynamoDB)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐                    │
│  │ Environments Table     │  │ Snapshots Table        │                    │
│  │ PK: id                 │  │ PK: environmentId      │                    │
│  │ - labName              │  │ SK: capturedAt         │                    │
│  │ - status               │  │ - packages             │                    │
│  │ - driftScore           │  │ - services             │                    │
│  │ - constraints          │  │ - aiDescription ⭐     │                    │
│  └────────────────────────┘  └────────────────────────┘                    │
│                                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐                    │
│  │ Drift Events Table     │  │ Audit Log Table        │                    │
│  │ PK: environmentId      │  │ PK: id                 │                    │
│  │ SK: detectedAt         │  │ - timestamp            │                    │
│  │ - severity             │  │ - actor                │                    │
│  │ - parameter            │  │ - action               │                    │
│  │ - expectedValue        │  │ - environmentId        │                    │
│  │ - actualValue          │  │ - details              │                    │
│  │ - resolved 🆕          │  └────────────────────────┘                    │
│  └────────────────────────┘                                                 │
│                                                                              │
│  ┌────────────────────────┐                                                 │
│  │ Alert Subscriptions 🆕 │                                                 │
│  │ PK: email/phone        │                                                 │
│  │ - subscriptionArn      │                                                 │
│  │ - protocol             │                                                 │
│  │ - createdAt            │                                                 │
│  └────────────────────────┘                                                 │
│                                                                              │
│  Billing Mode: PAY_PER_REQUEST                                               │
│  Encryption: AWS Managed Keys                                                │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                         AI/ML LAYER (Amazon Bedrock) ⭐                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    Amazon Bedrock Runtime                           │    │
│  │                                                                     │    │
│  │  Model: anthropic.claude-3-haiku-20240307-v1:0                     │    │
│  │  Region: us-east-1                                                  │    │
│  │                                                                     │    │
│  │  Use Cases:                                                         │    │
│  │  1. Drift Analysis - Analyze patterns, identify root causes 🆕     │    │
│  │     - Generate shell commands for remediation                      │    │
│  │     - Provide step-by-step fixes                                   │    │
│  │  2. Snapshot Descriptions - Generate human-readable summaries      │    │
│  │                                                                     │    │
│  │  Features:                                                          │    │
│  │  - Context-aware analysis (drift events + audit logs)              │    │
│  │  - WestTek Research Labs personality (Fallout-inspired) 🆕         │    │
│  │  - Actionable shell command recommendations                         │    │
│  │  - Real-time chat interface with code blocks                       │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  IAM Permissions: bedrock:InvokeModel                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION LAYER (SNS) 🆕                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    SNS Topic: DriftAlerts                           │    │
│  │                                                                     │    │
│  │  Protocols Supported:                                               │    │
│  │  - Email                                                            │    │
│  │  - SMS                                                              │    │
│  │                                                                     │    │
│  │  Triggered By:                                                      │    │
│  │  - Drift detection (check_drift Lambda)                            │    │
│  │  - Critical drift score thresholds                                 │    │
│  │                                                                     │    │
│  │  Message Format:                                                    │    │
│  │  - Environment details                                              │    │
│  │  - Drift score                                                      │    │
│  │  - Affected parameters                                              │    │
│  │  - Timestamp                                                        │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEMO ENVIRONMENT LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  VPC: vpc-045ad6d70eb2c8e0f                                                  │
│  Security Group: sg-04512cba87e66c22b                                        │
│                                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐                    │
│  │ Lab Mariposa 07        │  │ Lab West Tek 12        │                    │
│  │ EC2: i-0363823abe03d3a4f│  │ EC2: i-0848b45afdaf2a2bd│                    │
│  │ Status: FROZEN         │  │ Status: ACTIVE         │                    │
│  └────────────────────────┘  └────────────────────────┘                    │
│                                                                              │
│  Purpose: Demo EC2 instances for testing environment management             │
│  Note: Can be stopped when not in use to save costs                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Features

### ⭐ AI-Powered Features

#### 1. AI Drift Analysis Assistant with Remediation
- **Component**: `DriftAIAssistant.jsx`
- **Backend**: `analyze_drift_ai` Lambda
- **Model**: Claude 3 Haiku via Bedrock
- **Features**:
  - Interactive chat interface
  - Analyzes drift patterns from DynamoDB
  - Reviews audit logs for context
  - Provides root cause analysis
  - **Generates shell commands for remediation** 🆕
  - Code blocks with syntax highlighting
  - Copy-to-clipboard for commands
  - WestTek Research Labs personality (Fallout-inspired)

#### 2. AI-Generated Snapshot Descriptions
- **Component**: `SnapshotTerminal.jsx`
- **Backend**: `generate_snapshot_description` Lambda
- **Model**: Claude 3 Haiku via Bedrock
- **Features**:
  - Automatically generates human-readable descriptions
  - Summarizes snapshot contents
  - Highlights key components
  - Stored in DynamoDB with snapshot data

### 🆕 New Features Added

#### 3. Environment Creation Wizard
- **Component**: `OnboardingWizard.jsx`
- **Features**:
  - Create new research environments
  - Assign primary researcher
  - Configure experiment details
  - Simulated infrastructure provisioning
  - Auto-opens environment detail on completion
  - Adds to dashboard immediately

#### 4. Environment Deletion
- **Component**: `EnvironmentCard.jsx` (Delete Modal)
- **Features**:
  - Delete environments from dashboard
  - Confirmation modal with warnings
  - Removes from DynamoDB (simulated)
  - Adds audit log entry
  - Permanent removal simulation

#### 5. Drift Resolution
- **Component**: `DriftMonitor.jsx`
- **Context**: `VaultContext.jsx`
- **Features**:
  - "Resolve All Issues" button
  - Marks all drift events as resolved
  - Resets drift score to 0
  - Updates UI immediately
  - Adds audit log entry

#### 6. Real-Time Drift Notifications (Backend Ready)
- **Components**: `subscribe_alerts`, `send_drift_notification` Lambdas
- **Infrastructure**: SNS Topic + DynamoDB subscriptions table
- **Features**:
  - Email/SMS notification support
  - Triggered on drift detection
  - Subscription management API
  - Alert history tracking
  - **Note**: Backend fully deployed, frontend UI not added to avoid breaking existing functionality

#### 7. Enhanced UI Readability
- **Components**: All modals and wizards
- **Improvements**:
  - Solid black backgrounds (no transparency)
  - Bold, larger text throughout
  - Thicker borders (2px minimum)
  - Better contrast for all elements
  - Improved accessibility

#### 8. WestTek Rebranding
- **Scope**: Entire application
- **Changes**:
  - Rebranded from "Vault-Tec" to "WestTek Research Labs"
  - Updated all UI text and messages
  - Modified AI personality
  - Changed page title
  - Updated error messages and notifications

## Data Flow

### User Authentication Flow
1. User enters credentials in Login component
2. Cognito User Pool validates credentials
3. Returns JWT tokens (ID token, Access token, Refresh token)
4. Frontend exchanges JWT for temporary AWS credentials via Identity Pool
5. Identity Pool assumes authenticated IAM role
6. User can now call API Gateway with proper authorization

### AI Drift Analysis with Remediation Flow 🆕
1. User clicks "Ask AI Assistant" in Drift Monitor
2. Frontend calls `/environments/{id}/analyze-drift` with query
3. API Gateway validates Cognito JWT token
4. Lambda retrieves environment, drift events, and audit logs from DynamoDB
5. Lambda builds context and calls Bedrock Claude 3 Haiku
6. AI analyzes patterns and generates response with shell commands
7. Response returned to frontend with code blocks
8. User can copy commands with one click

### Environment Creation Flow 🆕
1. User completes Onboarding Wizard (4 steps)
2. Frontend creates new environment object locally
3. Environment added to VaultContext state
4. Audit log entry created
5. Dashboard switches to ENVIRONMENTS tab
6. New environment detail modal auto-opens
7. New environment appears as card on dashboard

### Drift Resolution Flow 🆕
1. User clicks "Resolve All Issues" in Drift Monitor
2. Frontend marks all drift events as resolved in state
3. Drift score reset to 0
4. Audit log entry added
5. UI updates immediately (drift bar, status)
6. Changes persist in local state

### Snapshot Capture with AI Description Flow
1. User clicks "Capture Snapshot" button
2. Frontend calls `/environments/{id}/snapshot`
3. Lambda captures environment state
4. Lambda invokes `generate_snapshot_description` Lambda
5. AI Lambda calls Bedrock to generate description
6. Snapshot + AI description saved to DynamoDB
7. Audit log entry created
8. Response returned to frontend with AI-generated description

### Drift Notification Flow (Backend Ready) 🆕
1. Drift detected by `check_drift` Lambda
2. Lambda publishes message to SNS topic
3. SNS sends notifications to all subscribers
4. Email/SMS delivered to subscribed users
5. Notification includes environment details and drift score

## Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS (custom WestTek theme - Fallout-inspired)
- AWS Amplify SDK (Auth, API)
- Lucide React (icons)
- Syntax highlighting for code blocks

### Backend
- AWS CDK (Python) for Infrastructure as Code
- API Gateway (REST API with Cognito authorizer)
- Lambda Functions (Python 3.11)
- DynamoDB (5 tables)
- Amazon Bedrock (Claude 3 Haiku)
- Amazon SNS (notifications)
- Cognito (User Pool + Identity Pool)

### Hosting
- AWS Amplify Hosting (frontend)
- CloudWatch Logs (Lambda monitoring)

## Security

- All API endpoints require Cognito authentication
- Identity Pool with IAM role-based access control
- HTTPS only (TLS 1.2+)
- DynamoDB encryption at rest (AWS managed keys)
- Lambda functions run with least-privilege IAM roles
- Bedrock access restricted to specific model
- SNS topic access controlled via IAM

## Deployment

- Infrastructure: `cdk deploy` (Python CDK)
- Frontend: Amplify manual deployment via zip upload
- Demo data: Auto-initialized on first API call
- Region: us-east-1
- Test credentials: testuser / TestPassword123!

## Cost Optimization

- DynamoDB: Pay-per-request billing
- Lambda: Pay per invocation
- Bedrock: Pay per token (Claude 3 Haiku is cost-effective)
- Amplify: Free tier eligible
- SNS: Pay per notification (very low cost)
- No NAT Gateway (cost savings)
- Demo EC2 instances can be stopped when not in use

## Hackathon Demo Features

This project was built for a hackathon and includes:
- ✅ AI-powered drift analysis with remediation commands
- ✅ Real-time environment monitoring
- ✅ Interactive chat interface with AI assistant
- ✅ Environment creation wizard
- ✅ Drift resolution workflow
- ✅ SNS notification infrastructure (backend ready)
- ✅ Fallout-inspired retro-futuristic UI theme
- ✅ Full CRUD operations on environments
- ✅ Comprehensive audit logging
- ✅ Snapshot management with AI descriptions
