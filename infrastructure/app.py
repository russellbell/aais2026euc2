#!/usr/bin/env python3
import aws_cdk as cdk
from stacks.backend_stack import BackendStack
from stacks.demo_environment_stack import DemoEnvironmentStack

app = cdk.App()

# Backend infrastructure (API, Lambda, DynamoDB, Cognito)
backend = BackendStack(
    app,
    "WestTekBackendStack",
    description="West Tek Vault Control - Backend Infrastructure"
)

# Demo EC2 environments for realistic snapshots
demo_envs = DemoEnvironmentStack(
    app,
    "WestTekDemoEnvironmentStack",
    description="West Tek Vault Control - Demo Lab Environments",
    api_lambda_role=backend.lambda_role
)

app.synth()
