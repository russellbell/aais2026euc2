# VPC Cost Optimization

## Current Setup

The infrastructure creates a dedicated VPC with:
- 2 Availability Zones
- Public and Private subnets
- 1 NAT Gateway (~$32/month)
- 3 VPC Endpoints for SSM (~$22/month)

**Total VPC costs: ~$54/month**

## Why This Setup?

- **Private Subnets**: EC2 instances are in private subnets for security
- **NAT Gateway**: Allows private instances to access internet (for yum updates, pip installs)
- **VPC Endpoints**: Direct connection to SSM without going through NAT (reduces data transfer costs)

## Cost Optimization Options

### Option 1: Current Setup (Recommended for Production)
**Cost:** ~$70/month total
**Pros:**
- Secure (instances in private subnets)
- Production-ready architecture
- VPC endpoints reduce data transfer costs

**Cons:**
- Higher cost

### Option 2: Public Subnets Only (Cheapest)
**Cost:** ~$15/month total (just EC2)
**How:** Place EC2 instances in public subnets, remove NAT Gateway and VPC endpoints

**Pros:**
- Much cheaper
- Still works for demo

**Cons:**
- Less secure (instances have public IPs)
- Not production-ready

### Option 3: No VPC (Use Default VPC)
**Cost:** ~$15/month total (just EC2)
**How:** Use default VPC if available

**Pros:**
- Cheapest option
- No VPC management

**Cons:**
- Requires default VPC to exist
- Less isolated

### Option 4: Deploy Only When Needed
**Cost:** ~$3/day when running
**How:** Deploy for demos, destroy after

**Pros:**
- Pay only when using
- Full production setup when needed

**Cons:**
- Takes 10 minutes to deploy each time

## Recommended Approach for Hackathon

### For Demo/Hackathon:
Use **Option 2** (Public Subnets) to minimize costs:

```python
# In demo_environment_stack.py, change to:
vpc = ec2.Vpc(
    self, "WestTekVPC",
    max_azs=2,
    nat_gateways=0,  # No NAT Gateway
    subnet_configuration=[
        ec2.SubnetConfiguration(
            name="Public",
            subnet_type=ec2.SubnetType.PUBLIC,
            cidr_mask=24
        )
    ]
)

# Remove VPC endpoints
# Place instances in public subnets
```

This reduces cost from ~$70/month to ~$15/month.

### For Production:
Keep current setup (Option 1) for security and best practices.

## How to Switch to Public Subnets

If you want to reduce costs, I can modify the code to:
1. Remove NAT Gateway
2. Remove VPC Endpoints
3. Place EC2 instances in public subnets
4. Add security group rules for SSM

This will reduce your monthly cost from ~$70 to ~$15.

## Current Cost Breakdown

| Component | Monthly Cost |
|-----------|--------------|
| NAT Gateway | $32.00 |
| VPC Endpoints (3x) | $21.60 |
| EC2 (2x t3.micro) | $15.00 |
| Lambda/API/DynamoDB | $1.00 (free tier) |
| **Total** | **~$70/month** |

## Recommendation

For a hackathon/demo project, I recommend switching to public subnets to save ~$55/month. The current setup is production-ready but expensive for a demo.

Would you like me to modify the infrastructure to use public subnets instead?
