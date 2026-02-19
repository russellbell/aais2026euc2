import json
import os
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
ec2 = boto3.client('ec2')
ssm = boto3.client('ssm')

environments_table = dynamodb.Table(os.environ['ENVIRONMENTS_TABLE'])

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj)
        return super(DecimalEncoder, self).default(obj)

def handler(event, context):
    """Get all environments with their current status"""
    try:
        # Scan DynamoDB for all environments
        response = environments_table.scan()
        environments = response.get('Items', [])
        
        # If no environments exist, initialize with demo data
        if not environments:
            environments = initialize_demo_environments()
        
        # Enrich with real-time EC2 instance status
        for env in environments:
            if 'instanceId' in env:
                try:
                    instance_response = ec2.describe_instances(
                        InstanceIds=[env['instanceId']]
                    )
                    if instance_response['Reservations']:
                        instance = instance_response['Reservations'][0]['Instances'][0]
                        env['instanceState'] = instance['State']['Name']
                except Exception as e:
                    print(f"Error getting instance status: {e}")
                    env['instanceState'] = 'unknown'
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'environments': environments
            }, cls=DecimalEncoder)
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'VAULT-TEC SYSTEMS ERROR: Failed to retrieve environments',
                'details': str(e)
            })
        }

def initialize_demo_environments():
    """Initialize DynamoDB with demo environment data"""
    demo_envs = [
        {
            'id': 'env-mariposa-07',
            'labName': 'Lab Mariposa 07',
            'facility': 'West Tek Headquarters',
            'researcher': {
                'name': 'Dr. J. Whitmore',
                'role': 'Senior Researcher'
            },
            'experimentId': 'FEV-2077-ALPHA',
            'experimentName': 'Forced Evolutionary Virus Batch 11-111',
            'status': 'FROZEN',
            'driftScore': 0,
            'lastSnapshotAt': '2077.10.23 14:32:01',
            'createdAt': '2077.08.15 09:00:00',
            'constraints': [
                'DO NOT update Python beyond 3.8.12',
                'CUDA driver must remain at 11.4',
                'FEV analyzer package is proprietary - no modifications'
            ],
            'cloudformationStackName': 'mariposa-07-stack',
            'cloudformationStackStatus': 'UPDATE_COMPLETE'
        },
        {
            'id': 'env-westtek-12',
            'labName': 'Lab West Tek 12',
            'facility': 'West Tek Headquarters',
            'researcher': {
                'name': 'Dr. A. Petrov',
                'role': 'Bio-Enhancement Lead'
            },
            'experimentId': 'BIO-2078-SERIES9',
            'experimentName': 'Bio-Enhancement Serum Series 9',
            'status': 'ACTIVE',
            'driftScore': 23,
            'lastSnapshotAt': '2077.10.20 09:30:00',
            'createdAt': '2077.09.01 10:15:00',
            'constraints': [
                'Serum synthesis requires exact temperature control',
                'NumPy version locked for reproducibility'
            ],
            'cloudformationStackName': 'westtek-12-stack',
            'cloudformationStackStatus': 'UPDATE_COMPLETE'
        }
    ]
    
    # Write to DynamoDB
    for env in demo_envs:
        environments_table.put_item(Item=env)
    
    return demo_envs
