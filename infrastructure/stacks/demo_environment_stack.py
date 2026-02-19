from aws_cdk import (
    Stack,
    CfnOutput,
    aws_ec2 as ec2,
    aws_iam as iam,
    aws_cloudformation as cfn,
)
from constructs import Construct

class DemoEnvironmentStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, api_lambda_role: iam.Role, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ========================================
        # VPC (create dedicated VPC)
        # ========================================
        
        vpc = ec2.Vpc(
            self, "WestTekVPC",
            max_azs=2,
            nat_gateways=1,  # One NAT Gateway for cost optimization
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="Public",
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="Private",
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidr_mask=24
                )
            ]
        )

        # Add VPC Endpoints for SSM (reduces NAT Gateway costs)
        vpc.add_interface_endpoint(
            "SSMEndpoint",
            service=ec2.InterfaceVpcEndpointAwsService.SSM
        )
        
        vpc.add_interface_endpoint(
            "SSMMessagesEndpoint",
            service=ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES
        )
        
        vpc.add_interface_endpoint(
            "EC2MessagesEndpoint",
            service=ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES
        )

        # ========================================
        # Security Group
        # ========================================
        
        security_group = ec2.SecurityGroup(
            self, "LabSecurityGroup",
            vpc=vpc,
            description="Security group for West Tek lab environments",
            allow_all_outbound=True
        )

        # Allow SSM access (no inbound rules needed for SSM Session Manager)

        # ========================================
        # IAM Role for EC2 (SSM Access)
        # ========================================
        
        ec2_role = iam.Role(
            self, "LabInstanceRole",
            assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonSSMManagedInstanceCore")
            ]
        )

        # ========================================
        # User Data Script
        # ========================================
        
        user_data = ec2.UserData.for_linux()
        user_data.add_commands(
            "#!/bin/bash",
            "# Update system",
            "yum update -y",
            "",
            "# Install Python and scientific packages",
            "yum install -y python3 python3-pip",
            "pip3 install numpy==1.21.0 scipy==1.7.3 pandas==1.3.5",
            "",
            "# Install Docker",
            "yum install -y docker",
            "systemctl start docker",
            "systemctl enable docker",
            "",
            "# Create mock West Tek packages",
            "mkdir -p /opt/wtek",
            "echo '2.1.0' > /opt/wtek/datalogger-version.txt",
            "echo '4.7.2' > /opt/wtek/fev-analyzer-version.txt",
            "",
            "# Set environment variables",
            "echo 'export FEV_DATA_PATH=/vault/data/fev' >> /etc/environment",
            "echo 'export CUDA_VISIBLE_DEVICES=0,1' >> /etc/environment",
            "",
            "# Create data directory",
            "mkdir -p /vault/data/fev",
            "",
            "# Signal completion",
            "echo 'West Tek Lab Environment initialized' > /var/log/wtek-init.log"
        )

        # ========================================
        # EC2 Instances (Lab Environments)
        # ========================================
        
        # Lab Mariposa 07 (FROZEN)
        lab_mariposa_07 = ec2.Instance(
            self, "LabMariposa07",
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO
            ),
            machine_image=ec2.MachineImage.latest_amazon_linux2(),
            vpc=vpc,
            security_group=security_group,
            role=ec2_role,
            user_data=user_data,
            instance_name="Lab-Mariposa-07"
        )

        # Add tags for identification
        lab_mariposa_07.node.add_metadata("EnvironmentId", "env-mariposa-07")
        lab_mariposa_07.node.add_metadata("LabName", "Lab Mariposa 07")
        lab_mariposa_07.node.add_metadata("ExperimentId", "FEV-2077-ALPHA")
        lab_mariposa_07.node.add_metadata("Status", "FROZEN")

        # Lab West Tek 12 (ACTIVE with drift)
        lab_westtek_12 = ec2.Instance(
            self, "LabWestTek12",
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO
            ),
            machine_image=ec2.MachineImage.latest_amazon_linux2(),
            vpc=vpc,
            security_group=security_group,
            role=ec2_role,
            user_data=user_data,
            instance_name="Lab-WestTek-12"
        )

        lab_westtek_12.node.add_metadata("EnvironmentId", "env-westtek-12")
        lab_westtek_12.node.add_metadata("LabName", "Lab West Tek 12")
        lab_westtek_12.node.add_metadata("ExperimentId", "BIO-2078-SERIES9")
        lab_westtek_12.node.add_metadata("Status", "ACTIVE")

        # ========================================
        # CloudFormation Stacks for Drift Detection
        # ========================================
        
        # These are nested stacks that can be monitored for drift
        # We'll create simple S3 bucket stacks as examples
        
        # Note: In CDK, we can't easily create "demo drift" but we can
        # create stacks that the drift detection API can monitor

        # ========================================
        # Outputs
        # ========================================
        
        CfnOutput(
            self, "VpcId",
            value=vpc.vpc_id,
            description="VPC ID for West Tek lab environments"
        )

        CfnOutput(
            self, "LabMariposa07InstanceId",
            value=lab_mariposa_07.instance_id,
            description="Instance ID for Lab Mariposa 07"
        )

        CfnOutput(
            self, "LabWestTek12InstanceId",
            value=lab_westtek_12.instance_id,
            description="Instance ID for Lab West Tek 12"
        )

        CfnOutput(
            self, "SecurityGroupId",
            value=security_group.security_group_id,
            description="Security Group ID for lab instances"
        )
