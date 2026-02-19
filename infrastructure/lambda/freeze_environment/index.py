import json
import os
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
environments_table = dynamodb.Table(os.environ['ENVIRONMENTS_TABLE'])
audit_log_table = dynamodb.Table(os.environ['AUDIT_LOG_TABLE'])

def handler(event, context):
    """Freeze or unfreeze an environment"""
    try:
        environment_id = event['pathParameters']['id']
        body = json.loads(event['body'])
        action = body.get('action', 'freeze')  # 'freeze' or 'unfreeze'
        
        # Get environment
        env_response = environments_table.get_item(Key={'id': environment_id})
        if 'Item' not in env_response:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Environment not found'})
            }
        
        environment = env_response['Item']
        
        # Update status
        new_status = 'FROZEN' if action == 'freeze' else 'ACTIVE'
        environments_table.update_item(
            Key={'id': environment_id},
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': new_status}
        )
        
        # Log audit event
        timestamp = datetime.now().strftime('%Y.%m.%d %H:%M:%S')
        audit_log_table.put_item(Item={
            'id': f"log-{int(datetime.now().timestamp() * 1000)}",
            'timestamp': timestamp,
            'actor': body.get('actor', 'System'),
            'environmentId': environment_id,
            'action': 'ENV_FROZEN' if action == 'freeze' else 'ENV_UNFROZEN',
            'details': f"Environment {environment.get('labName')} {'frozen' if action == 'freeze' else 'unfrozen'}",
            'severity': 'warning' if action == 'freeze' else 'info'
        })
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': f"Environment {action}d successfully",
                'status': new_status
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
