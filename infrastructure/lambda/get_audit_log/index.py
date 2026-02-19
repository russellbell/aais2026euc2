import json
import os
import boto3

dynamodb = boto3.resource('dynamodb')
audit_log_table = dynamodb.Table(os.environ['AUDIT_LOG_TABLE'])

def handler(event, context):
    """Get audit log entries"""
    try:
        # Get query parameters
        params = event.get('queryStringParameters', {}) or {}
        environment_id = params.get('environmentId')
        limit = int(params.get('limit', 50))
        
        if environment_id:
            # Query by environment
            response = audit_log_table.query(
                IndexName='EnvironmentIndex',  # Would need to add GSI
                KeyConditionExpression='environmentId = :env_id',
                ExpressionAttributeValues={':env_id': environment_id},
                Limit=limit,
                ScanIndexForward=False
            )
        else:
            # Scan all (for demo purposes)
            response = audit_log_table.scan(Limit=limit)
        
        items = response.get('Items', [])
        
        # Sort by timestamp descending
        items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'auditLog': items[:limit]
            }, default=str)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
