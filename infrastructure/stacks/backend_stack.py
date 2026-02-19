from aws_cdk import (
    Stack,
    Duration,
    RemovalPolicy,
    CfnOutput,
    aws_dynamodb as dynamodb,
    aws_lambda as lambda_,
    aws_apigateway as apigateway,
    aws_cognito as cognito,
    aws_iam as iam,
    aws_logs as logs,
)
from constructs import Construct

class BackendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ========================================
        # DynamoDB Tables
        # ========================================
        
        # Environments table
        self.environments_table = dynamodb.Table(
            self, "EnvironmentsTable",
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )

        # Snapshots table
        self.snapshots_table = dynamodb.Table(
            self, "SnapshotsTable",
            partition_key=dynamodb.Attribute(
                name="environmentId",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="capturedAt",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # Drift Events table
        self.drift_events_table = dynamodb.Table(
            self, "DriftEventsTable",
            partition_key=dynamodb.Attribute(
                name="environmentId",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="detectedAt",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # Audit Log table
        self.audit_log_table = dynamodb.Table(
            self, "AuditLogTable",
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="timestamp",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # ========================================
        # Cognito User Pool
        # ========================================
        
        user_pool = cognito.UserPool(
            self, "WestTekUserPool",
            user_pool_name="west-tek-vault-control",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(
                email=True,
                username=True
            ),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=True)
            ),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=False
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            removal_policy=RemovalPolicy.DESTROY
        )

        # User Pool Client
        user_pool_client = user_pool.add_client(
            "WestTekUserPoolClient",
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True
            ),
            generate_secret=False,
            prevent_user_existence_errors=True
        )

        # Identity Pool
        identity_pool = cognito.CfnIdentityPool(
            self, "WestTekIdentityPool",
            identity_pool_name="west_tek_identity_pool",
            allow_unauthenticated_identities=False,
            cognito_identity_providers=[
                cognito.CfnIdentityPool.CognitoIdentityProviderProperty(
                    client_id=user_pool_client.user_pool_client_id,
                    provider_name=user_pool.user_pool_provider_name
                )
            ]
        )

        # ========================================
        # IAM Roles for Lambda
        # ========================================
        
        self.lambda_role = iam.Role(
            self, "LambdaExecutionRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole")
            ]
        )

        # Grant Lambda permissions
        self.environments_table.grant_read_write_data(self.lambda_role)
        self.snapshots_table.grant_read_write_data(self.lambda_role)
        self.drift_events_table.grant_read_write_data(self.lambda_role)
        self.audit_log_table.grant_read_write_data(self.lambda_role)

        # SSM permissions
        self.lambda_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "ssm:SendCommand",
                "ssm:GetCommandInvocation",
                "ssm:ListCommandInvocations",
                "ssm:DescribeInstanceInformation",
                "ssm:GetInventory"
            ],
            resources=["*"]
        ))

        # CloudFormation permissions
        self.lambda_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "cloudformation:DescribeStacks",
                "cloudformation:DetectStackDrift",
                "cloudformation:DescribeStackDriftDetectionStatus",
                "cloudformation:DescribeStackResourceDrifts"
            ],
            resources=["*"]
        ))

        # WorkSpaces permissions
        self.lambda_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "workspaces:DescribeWorkspaces",
                "workspaces:DescribeWorkspaceBundles",
                "workspaces:CreateWorkspaces"
            ],
            resources=["*"]
        ))

        # EC2 permissions for instance details
        self.lambda_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "ec2:DescribeInstances",
                "ec2:DescribeTags"
            ],
            resources=["*"]
        ))

        # ========================================
        # Lambda Functions
        # ========================================
        
        # Common environment variables
        lambda_env = {
            "ENVIRONMENTS_TABLE": self.environments_table.table_name,
            "SNAPSHOTS_TABLE": self.snapshots_table.table_name,
            "DRIFT_EVENTS_TABLE": self.drift_events_table.table_name,
            "AUDIT_LOG_TABLE": self.audit_log_table.table_name
        }

        # Get Environments
        get_environments_fn = lambda_.Function(
            self, "GetEnvironmentsFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=lambda_.Code.from_asset("lambda/get_environments"),
            environment=lambda_env,
            role=self.lambda_role,
            timeout=Duration.seconds(30),
            log_retention=logs.RetentionDays.ONE_WEEK
        )

        # Capture Snapshot
        capture_snapshot_fn = lambda_.Function(
            self, "CaptureSnapshotFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=lambda_.Code.from_asset("lambda/capture_snapshot"),
            environment=lambda_env,
            role=self.lambda_role,
            timeout=Duration.seconds(300),
            log_retention=logs.RetentionDays.ONE_WEEK
        )

        # Check Drift
        check_drift_fn = lambda_.Function(
            self, "CheckDriftFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=lambda_.Code.from_asset("lambda/check_drift"),
            environment=lambda_env,
            role=self.lambda_role,
            timeout=Duration.seconds(300),
            log_retention=logs.RetentionDays.ONE_WEEK
        )

        # Freeze Environment
        freeze_environment_fn = lambda_.Function(
            self, "FreezeEnvironmentFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=lambda_.Code.from_asset("lambda/freeze_environment"),
            environment=lambda_env,
            role=self.lambda_role,
            timeout=Duration.seconds(30),
            log_retention=logs.RetentionDays.ONE_WEEK
        )

        # Get Audit Log
        get_audit_log_fn = lambda_.Function(
            self, "GetAuditLogFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=lambda_.Code.from_asset("lambda/get_audit_log"),
            environment=lambda_env,
            role=self.lambda_role,
            timeout=Duration.seconds(30),
            log_retention=logs.RetentionDays.ONE_WEEK
        )

        # ========================================
        # API Gateway
        # ========================================
        
        api = apigateway.RestApi(
            self, "WestTekApi",
            rest_api_name="West Tek Vault Control API",
            description="API for West Tek environment management",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=apigateway.Cors.ALL_ORIGINS,
                allow_methods=apigateway.Cors.ALL_METHODS,
                allow_headers=["Content-Type", "Authorization"]
            ),
            deploy_options=apigateway.StageOptions(
                stage_name="prod",
                throttling_rate_limit=100,
                throttling_burst_limit=200
            )
        )

        # Cognito Authorizer
        authorizer = apigateway.CognitoUserPoolsAuthorizer(
            self, "ApiAuthorizer",
            cognito_user_pools=[user_pool]
        )

        # API Resources and Methods
        environments = api.root.add_resource("environments")
        environments.add_method(
            "GET",
            apigateway.LambdaIntegration(get_environments_fn),
            authorizer=authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )

        # /environments/{id}/snapshot
        environment_id = environments.add_resource("{id}")
        snapshot = environment_id.add_resource("snapshot")
        snapshot.add_method(
            "POST",
            apigateway.LambdaIntegration(capture_snapshot_fn),
            authorizer=authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )

        # /environments/{id}/drift
        drift = environment_id.add_resource("drift")
        drift.add_method(
            "GET",
            apigateway.LambdaIntegration(check_drift_fn),
            authorizer=authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )

        # /environments/{id}/freeze
        freeze = environment_id.add_resource("freeze")
        freeze.add_method(
            "POST",
            apigateway.LambdaIntegration(freeze_environment_fn),
            authorizer=authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )

        # /audit-log
        audit_log = api.root.add_resource("audit-log")
        audit_log.add_method(
            "GET",
            apigateway.LambdaIntegration(get_audit_log_fn),
            authorizer=authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )

        # ========================================
        # Outputs
        # ========================================
        
        CfnOutput(self, "ApiEndpoint", value=api.url, description="API Gateway endpoint")
        CfnOutput(self, "UserPoolId", value=user_pool.user_pool_id, description="Cognito User Pool ID")
        CfnOutput(self, "UserPoolClientId", value=user_pool_client.user_pool_client_id, description="Cognito User Pool Client ID")
        CfnOutput(self, "IdentityPoolId", value=identity_pool.ref, description="Cognito Identity Pool ID")
        CfnOutput(self, "Region", value=self.region, description="AWS Region")
