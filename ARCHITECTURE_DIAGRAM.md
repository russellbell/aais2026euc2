# West Tek Vault Control - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    React SPA (Vite + Tailwind)                     │    │
│  │                                                                     │    │
│  │  • Boot Sequence (CRT effects)                                     │    │
│  │  • Environment Dashboard                                           │    │
│  │  • Drift Monitor                                                   │    │
│  │  • Vault Log                                                       │    │
│  │  • Demo Mode                                                       │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    │ HTTPS                                   │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      AWS Amplify SDK                                │    │
│  │                                                                     │    │
│  │  • Authentication (Cognito)                                        │    │
│  │  • API Client (JWT tokens)                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTPS + JWT
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                AWS CLOUD                                     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Amazon Cognito                                   │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐         ┌──────────────────┐                   │  │
│  │  │   User Pool     │         │  Identity Pool   │                   │  │
│  │  │                 │         │                  │                   │  │
│  │  │ • Email/Username│────────▶│ • AWS Credentials│                   │  │
│  │  │ • Password Auth │         │ • Temp Tokens    │                   │  │
│  │  └─────────────────┘         └──────────────────┘                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                                     │ Authorizes                             │
│                                     ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    API Gateway (REST API)                             │  │
│  │                                                                       │  │
│  │  Endpoints:                                                           │  │
│  │  • GET  /environments              → List all environments           │  │
│  │  • POST /environments/{id}/snapshot → Capture snapshot               │  │
│  │  • GET  /environments/{id}/drift    → Check drift                    │  │
│  │  • POST /environments/{id}/freeze   → Freeze/unfreeze                │  │
│  │  • GET  /audit-log                  → Get audit trail                │  │
│  │                                                                       │  │
│  │  [Cognito Authorizer validates JWT on every request]                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                                     │ Invokes                                │
│                                     ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      AWS Lambda Functions                             │  │
│  │                         (Python 3.11)                                 │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐  ┌────────────────────┐                     │  │
│  │  │ GetEnvironments    │  │ CaptureSnapshot    │                     │  │
│  │  │                    │  │                    │                     │  │
│  │  │ • Scan DynamoDB    │  │ • Discover EC2     │                     │  │
│  │  │ • Enrich with EC2  │  │ • Send SSM command │                     │  │
│  │  │ • Return list      │  │ • Parse output     │                     │  │
│  │  └────────────────────┘  └────────────────────┘                     │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐  ┌────────────────────┐                     │  │
│  │  │ CheckDrift         │  │ FreezeEnvironment  │                     │  │
│  │  │                    │  │                    │                     │  │
│  │  │ • Query snapshots  │  │ • Update status    │                     │  │
│  │  │ • Get drift events │  │ • Log audit event  │                     │  │
│  │  │ • Calculate score  │  │ • Return result    │                     │  │
│  │  └────────────────────┘  └────────────────────┘                     │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐                                              │  │
│  │  │ GetAuditLog        │                                              │  │
│  │  │                    │                                              │  │
│  │  │ • Query audit log  │                                              │  │
│  │  │ • Filter by env    │                                              │  │
│  │  │ • Sort & paginate  │                                              │  │
│  │  └────────────────────┘                                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│           │                    │                    │                        │
│           │ Read/Write         │ SSM Commands       │ Describe               │
│           ▼                    ▼                    ▼                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   DynamoDB      │  │  Systems Manager│  │   EC2 Service   │            │
│  │                 │  │      (SSM)      │  │                 │            │
│  │ ┌─────────────┐ │  │                 │  │ • Describe      │            │
│  │ │Environments │ │  │ • SendCommand   │  │   Instances     │            │
│  │ │             │ │  │ • GetCommand    │  │ • Get Status    │            │
│  │ │ • id        │ │  │   Invocation    │  │ • List Tags     │            │
│  │ │ • labName   │ │  │                 │  │                 │            │
│  │ │ • status    │ │  └────────┬────────┘  └─────────────────┘            │
│  │ │ • driftScore│ │           │                                            │
│  │ └─────────────┘ │           │ Executes commands on                       │
│  │                 │           ▼                                            │
│  │ ┌─────────────┐ │  ┌──────────────────────────────────────────────┐    │
│  │ │ Snapshots   │ │  │           Custom VPC                          │    │
│  │ │             │ │  │                                               │    │
│  │ │ • envId     │ │  │  ┌──────────────────────────────────────┐   │    │
│  │ │ • timestamp │ │  │  │      Availability Zone 1              │   │    │
│  │ │ • packages  │ │  │  │                                       │   │    │
│  │ │ • services  │ │  │  │  ┌────────────┐  ┌────────────────┐ │   │    │
│  │ └─────────────┘ │  │  │  │Public Subnet│  │Private Subnet  │ │   │    │
│  │                 │  │  │  │            │  │                │ │   │    │
│  │ ┌─────────────┐ │  │  │  │ NAT Gateway│  │  ┌──────────┐ │ │   │    │
│  │ │DriftEvents  │ │  │  │  │     ↓      │  │  │ EC2      │ │ │   │    │
│  │ │             │ │  │  │  └────────────┘  │  │ Lab      │ │ │   │    │
│  │ │ • envId     │ │  │  │                  │  │ Mariposa │ │ │   │    │
│  │ │ • severity  │ │  │  │                  │  │ 07       │ │ │   │    │
│  │ │ • component │ │  │  │                  │  │ (t3.micro)│ │ │   │    │
│  │ └─────────────┘ │  │  │                  │  │          │ │ │   │    │
│  │                 │  │  │                  │  │ • SSM    │ │ │   │    │
│  │ ┌─────────────┐ │  │  │                  │  │   Agent  │ │ │   │    │
│  │ │ AuditLog    │ │  │  │                  │  │ • Python │ │ │   │    │
│  │ │             │ │  │  │                  │  │ • Docker │ │ │   │    │
│  │ │ • id        │ │  │  │                  │  └──────────┘ │ │   │    │
│  │ │ • timestamp │ │  │  └──────────────────────────────────┘ │   │    │
│  │ │ • actor     │ │  │                                        │   │    │
│  │ │ • action    │ │  │  ┌──────────────────────────────────┐ │   │    │
│  │ │ • details   │ │  │  │      Availability Zone 2          │ │   │    │
│  │ └─────────────┘ │  │  │                                   │ │   │    │
│  │                 │  │  │  ┌────────────┐  ┌─────────────┐ │ │   │    │
│  │ Pay-per-request │  │  │  │Public Subnet│  │Private Subnet│ │   │    │
│  │ billing         │  │  │  │            │  │             │ │ │   │    │
│  └─────────────────┘  │  │  └────────────┘  │ ┌─────────┐ │ │   │    │
│                       │  │                   │ │ EC2     │ │ │   │    │
│                       │  │                   │ │ Lab     │ │ │   │    │
│                       │  │                   │ │ WestTek │ │ │   │    │
│                       │  │                   │ │ 12      │ │ │   │    │
│                       │  │                   │ │(t3.micro)│ │   │    │
│                       │  │                   │ │         │ │ │   │    │
│                       │  │                   │ │ • SSM   │ │ │   │    │
│                       │  │                   │ │   Agent │ │ │   │    │
│                       │  │                   │ │ • Python│ │ │   │    │
│                       │  │                   │ │ • Docker│ │ │   │    │
│                       │  │                   │ └─────────┘ │ │   │    │
│                       │  │                   └─────────────┘ │   │    │
│                       │  │                                    │   │    │
│                       │  │  VPC Endpoints (Private):          │   │    │
│                       │  │  • com.amazonaws.region.ssm        │   │    │
│                       │  │  • com.amazonaws.region.ssmmessages│   │    │
│                       │  │  • com.amazonaws.region.ec2messages│   │    │
│                       │  │                                    │   │    │
│                       │  │  (Allows SSM without NAT Gateway)  │   │    │
│                       │  └────────────────────────────────────┘   │    │
│                       └───────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Layer
- **Technology**: React 18 + Vite + Tailwind CSS
- **Hosting**: Local development (can deploy to S3 + CloudFront)
- **Authentication**: AWS Amplify SDK with Cognito integration
- **Features**: Real-time environment monitoring, drift detection, audit logging

### API Layer
- **Service**: Amazon API Gateway (REST API)
- **Authentication**: Cognito User Pools Authorizer (JWT validation)
- **CORS**: Enabled for local development
- **Throttling**: 100 requests/second, 200 burst

### Compute Layer
- **Service**: AWS Lambda (Python 3.11)
- **Functions**: 5 serverless functions
- **Timeout**: 30s (most), 300s (snapshot/drift)
- **Memory**: Default (128 MB, auto-scales)
- **Permissions**: IAM role with SSM, DynamoDB, EC2, CloudFormation access

### Data Layer
- **Service**: Amazon DynamoDB
- **Tables**: 4 tables with pay-per-request billing
- **Backup**: Point-in-time recovery enabled
- **Indexes**: GSI for environment-based queries

### Authentication Layer
- **Service**: Amazon Cognito
- **User Pool**: Email/username authentication
- **Identity Pool**: AWS credential vending
- **Password Policy**: 8+ chars, upper, lower, numbers

### Infrastructure Layer
- **VPC**: Custom VPC with 2 AZs
- **Subnets**: Public (NAT) + Private (EC2 instances)
- **NAT Gateway**: 1 gateway for internet access
- **VPC Endpoints**: 3 endpoints for SSM (reduces NAT costs)
- **Security Groups**: Restrictive, SSM-only access

### Lab Environments
- **Service**: Amazon EC2
- **Instance Type**: t3.micro (2 instances)
- **OS**: Amazon Linux 2
- **Management**: AWS Systems Manager (SSM)
- **Software**: Python, NumPy, SciPy, Docker
- **Access**: No SSH, SSM Session Manager only

## Data Flow

### 1. User Login
```
Browser → Cognito User Pool → JWT Token → Browser Storage
```

### 2. List Environments
```
Browser → API Gateway (JWT check) → Lambda → DynamoDB → EC2 (status) → Response
```

### 3. Capture Snapshot
```
Browser → API Gateway → Lambda → EC2 (discover) → SSM (send command) 
→ EC2 (execute) → SSM (get output) → Lambda (parse) → DynamoDB (store) 
→ Audit Log → Response
```

### 4. Check Drift
```
Browser → API Gateway → Lambda → DynamoDB (snapshots + drift events) 
→ Calculate score → Response
```

### 5. Freeze Environment
```
Browser → API Gateway → Lambda → DynamoDB (update status) 
→ Audit Log → Response
```

## Security Features

1. **Authentication**: Cognito User Pool with email verification
2. **Authorization**: JWT tokens validated on every API request
3. **Network Isolation**: EC2 instances in private subnets
4. **No SSH**: SSM Session Manager for secure access
5. **IAM Roles**: Least privilege permissions
6. **Encryption**: DynamoDB encryption at rest (default)
7. **HTTPS**: All API communication encrypted in transit

## Cost Breakdown (~$70/month)

| Service | Cost | Notes |
|---------|------|-------|
| NAT Gateway | ~$32 | $0.045/hour + data transfer |
| VPC Endpoints (3) | ~$21 | $0.01/hour each |
| EC2 (2x t3.micro) | ~$15 | $0.0104/hour each |
| DynamoDB | ~$1 | Pay-per-request (minimal usage) |
| Lambda | <$1 | Pay-per-invocation (minimal) |
| API Gateway | <$1 | Pay-per-request (minimal) |
| Cognito | Free | <50,000 MAUs |
| **Total** | **~$70** | |

## Deployment Method

- **Tool**: AWS CDK (Python)
- **Stacks**: 2 CloudFormation stacks
- **Automation**: Single `deploy.sh` script
- **Time**: ~15-20 minutes
- **Rollback**: CloudFormation automatic rollback on failure
