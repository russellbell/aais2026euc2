import json
import os
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
drift_events_table = dynamodb.Table(os.environ['DRIFT_EVENTS_TABLE'])
snapshots_table = dynamodb.Table(os.environ['SNAPSHOTS_TABLE'])
environments_table = dynamodb.Table(os.environ['ENVIRONMENTS_TABLE'])

def handler(event, context):
    """Check for drift in environment"""
    try:
        environment_id = event['pathParameters']['id']
        
        # Get latest snapshot
        response = snapshots_table.query(
            KeyConditionExpression='environmentId = :env_id',
            ExpressionAttributeValues={':env_id': environment_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        if not response['Items']:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No snapshots found'})
            }
        
        # Get drift events
        drift_response = drift_events_table.query(
            KeyConditionExpression='environmentId = :env_id',
            ExpressionAttributeValues={':env_id': environment_id}
        )
        
        drift_events = drift_response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'driftEvents': drift_events,
                'driftScore': calculate_drift_score(drift_events)
            }, default=str)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def calculate_drift_score(drift_events):
    """Calculate drift score from events"""
    if not drift_events:
        return 0
    
    score = 0
    for event in drift_events:
        if event.get('severity') == 'CRITICAL':
            score += 30
        elif event.get('severity') == 'WARNING':
            score += 10
        else:
            score += 3
    
    return min(score, 100)
