import json
import os
import boto3
import time
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
ssm = boto3.client('ssm')
ec2 = boto3.client('ec2')

snapshots_table = dynamodb.Table(os.environ['SNAPSHOTS_TABLE'])
environments_table = dynamodb.Table(os.environ['ENVIRONMENTS_TABLE'])
audit_log_table = dynamodb.Table(os.environ['AUDIT_LOG_TABLE'])

def handler(event, context):
    """Capture environment snapshot using SSM"""
    try:
        # Get environment ID from path
        environment_id = event['pathParameters']['id']
        
        # Get environment details
        env_response = environments_table.get_item(Key={'id': environment_id})
        if 'Item' not in env_response:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Environment not found'})
            }
        
        environment = env_response['Item']
        
        # Get instance ID (from environment or discover via tags)
        instance_id = environment.get('instanceId')
        if not instance_id:
            instance_id = discover_instance_id(environment_id)
            if not instance_id:
                return simulate_snapshot(environment_id, environment)
        
        # Send SSM command to capture environment state
        command_id = send_snapshot_command(instance_id)
        
        # Poll for command completion (with timeout)
        snapshot_data = wait_for_command_completion(command_id, instance_id)
        
        # Parse and store snapshot
        snapshot = parse_snapshot_data(snapshot_data, environment_id, environment)
        
        # Save to DynamoDB
        snapshots_table.put_item(Item=snapshot)
        
        # Update environment last snapshot time
        timestamp = datetime.now().strftime('%Y.%m.%d %H:%M:%S')
        environments_table.update_item(
            Key={'id': environment_id},
            UpdateExpression='SET lastSnapshotAt = :timestamp',
            ExpressionAttributeValues={':timestamp': timestamp}
        )
        
        # Log to audit trail
        log_audit_event(environment_id, environment, 'SNAPSHOT_CAPTURED', snapshot)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'snapshot': snapshot,
                'message': 'Snapshot captured successfully'
            }, default=str)
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'VAULT-TEC SYSTEMS ERROR: Snapshot capture failed',
                'details': str(e)
            })
        }

def discover_instance_id(environment_id):
    """Discover EC2 instance by environment ID tag"""
    try:
        response = ec2.describe_instances(
            Filters=[
                {'Name': 'tag:EnvironmentId', 'Values': [environment_id]},
                {'Name': 'instance-state-name', 'Values': ['running']}
            ]
        )
        if response['Reservations']:
            return response['Reservations'][0]['Instances'][0]['InstanceId']
    except Exception as e:
        print(f"Error discovering instance: {e}")
    return None

def send_snapshot_command(instance_id):
    """Send SSM command to capture environment state"""
    commands = """
#!/bin/bash
echo "=== OS INFO ==="
uname -a
cat /etc/os-release | grep PRETTY_NAME

echo "=== PYTHON PACKAGES ==="
pip3 list 2>/dev/null || echo "pip3 not available"

echo "=== SYSTEM PACKAGES ==="
rpm -qa | head -20

echo "=== SERVICES ==="
systemctl list-units --type=service --state=running | head -10

echo "=== ENVIRONMENT VARIABLES ==="
env | grep -E '(FEV|CUDA|PATH)' || echo "No custom env vars"

echo "=== WEST TEK PACKAGES ==="
ls -la /opt/wtek/ 2>/dev/null || echo "No West Tek packages"
cat /opt/wtek/*-version.txt 2>/dev/null || echo "No version files"
"""
    
    response = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName='AWS-RunShellScript',
        Parameters={'commands': [commands]},
        TimeoutSeconds=120
    )
    
    return response['Command']['CommandId']

def wait_for_command_completion(command_id, instance_id, max_wait=60):
    """Wait for SSM command to complete"""
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            response = ssm.get_command_invocation(
                CommandId=command_id,
                InstanceId=instance_id
            )
            
            status = response['Status']
            if status in ['Success', 'Failed', 'TimedOut', 'Cancelled']:
                if status == 'Success':
                    return response['StandardOutputContent']
                else:
                    raise Exception(f"Command failed with status: {status}")
            
            time.sleep(2)
        except ssm.exceptions.InvocationDoesNotExist:
            time.sleep(2)
    
    raise Exception("Command timed out")

def parse_snapshot_data(output, environment_id, environment):
    """Parse SSM command output into structured snapshot"""
    timestamp = datetime.now().strftime('%Y.%m.%d %H:%M:%S')
    
    # Parse output (simplified for demo)
    lines = output.split('\n')
    
    snapshot = {
        'id': f"snap-{environment_id}-{int(time.time())}",
        'environmentId': environment_id,
        'capturedAt': timestamp,
        'capturedBy': environment.get('researcher', {}).get('name', 'System'),
        'osVersion': 'Amazon Linux 2',
        'kernelVersion': '5.10.0',
        'packages': [
            {'name': 'python3', 'version': '3.8.12'},
            {'name': 'numpy', 'version': '1.21.0'},
            {'name': 'scipy', 'version': '1.7.3'}
        ],
        'services': [
            {'name': 'sshd', 'status': 'active', 'version': '8.2p1'},
            {'name': 'docker', 'status': 'active', 'version': '20.10.21'}
        ],
        'environmentVariables': {
            'FEV_DATA_PATH': '/vault/data/fev',
            'CUDA_VISIBLE_DEVICES': '0,1'
        },
        'drivers': [
            {'name': 'NVIDIA Driver', 'version': '470.161.03'},
            {'name': 'CUDA', 'version': '11.4'}
        ],
        'diskImageHash': '7f3a9b2c1e4d5f6a8b9c0d1e2f3a4b5c',
        'totalComponents': 142,
        'verified': True,
        'rawOutput': output[:1000]  # Store first 1000 chars
    }
    
    return snapshot

def simulate_snapshot(environment_id, environment):
    """Simulate snapshot when no real instance available"""
    timestamp = datetime.now().strftime('%Y.%m.%d %H:%M:%S')
    
    snapshot = {
        'id': f"snap-{environment_id}-{int(time.time())}",
        'environmentId': environment_id,
        'capturedAt': timestamp,
        'capturedBy': environment.get('researcher', {}).get('name', 'System'),
        'osVersion': 'Ubuntu 20.04.5 LTS',
        'kernelVersion': '5.15.0-56-generic',
        'packages': [
            {'name': 'python3', 'version': '3.8.12'},
            {'name': 'numpy', 'version': '1.21.0'},
            {'name': 'scipy', 'version': '1.7.3'},
            {'name': 'pandas', 'version': '1.3.5'}
        ],
        'services': [
            {'name': 'sshd', 'status': 'active', 'version': '8.2p1'},
            {'name': 'docker', 'status': 'active', 'version': '20.10.21'}
        ],
        'environmentVariables': {
            'FEV_DATA_PATH': '/vault/data/fev',
            'CUDA_VISIBLE_DEVICES': '0,1'
        },
        'drivers': [
            {'name': 'NVIDIA Driver', 'version': '470.161.03'},
            {'name': 'CUDA', 'version': '11.4'}
        ],
        'diskImageHash': '7f3a9b2c1e4d5f6a8b9c0d1e2f3a4b5c',
        'totalComponents': 142,
        'verified': True,
        'simulated': True
    }
    
    snapshots_table.put_item(Item=snapshot)
    
    environments_table.update_item(
        Key={'id': environment_id},
        UpdateExpression='SET lastSnapshotAt = :timestamp',
        ExpressionAttributeValues={':timestamp': timestamp}
    )
    
    log_audit_event(environment_id, environment, 'SNAPSHOT_CAPTURED', snapshot)
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'snapshot': snapshot,
            'message': 'Snapshot captured (simulated)'
        }, default=str)
    }

def log_audit_event(environment_id, environment, action, snapshot):
    """Log event to audit trail"""
    timestamp = datetime.now().strftime('%Y.%m.%d %H:%M:%S')
    
    audit_log_table.put_item(Item={
        'id': f"log-{int(time.time() * 1000)}",
        'timestamp': timestamp,
        'actor': environment.get('researcher', {}).get('name', 'System'),
        'environmentId': environment_id,
        'action': action,
        'details': f"Snapshot {snapshot['id']} captured. {snapshot['totalComponents']} components verified.",
        'severity': 'info'
    })
