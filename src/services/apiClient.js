import { get, post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { apiName } from '../config/aws-config';

class ApiClient {
  async getAuthHeaders() {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      return {
        Authorization: `Bearer ${token}`
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      throw error;
    }
  }

  async getEnvironments() {
    try {
      const headers = await this.getAuthHeaders();
      const restOperation = get({
        apiName,
        path: '/environments',
        options: { headers }
      });
      
      const response = await restOperation.response;
      const data = await response.body.json();
      return data.environments;
    } catch (error) {
      console.error('Error fetching environments:', error);
      throw error;
    }
  }

  async captureSnapshot(environmentId) {
    try {
      const headers = await this.getAuthHeaders();
      const restOperation = post({
        apiName,
        path: `/environments/${environmentId}/snapshot`,
        options: { headers }
      });
      
      const response = await restOperation.response;
      const data = await response.body.json();
      return data;
    } catch (error) {
      console.error('Error capturing snapshot:', error);
      throw error;
    }
  }

  async checkDrift(environmentId) {
    try {
      const headers = await this.getAuthHeaders();
      const restOperation = get({
        apiName,
        path: `/environments/${environmentId}/drift`,
        options: { headers }
      });
      
      const response = await restOperation.response;
      const data = await response.body.json();
      return data;
    } catch (error) {
      console.error('Error checking drift:', error);
      throw error;
    }
  }

  async freezeEnvironment(environmentId, action = 'freeze', actor = 'User') {
    try {
      const headers = await this.getAuthHeaders();
      const restOperation = post({
        apiName,
        path: `/environments/${environmentId}/freeze`,
        options: {
          headers,
          body: { action, actor }
        }
      });
      
      const response = await restOperation.response;
      const data = await response.body.json();
      return data;
    } catch (error) {
      console.error('Error freezing environment:', error);
      throw error;
    }
  }

  async getAuditLog(environmentId = null, limit = 50) {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      if (environmentId) queryParams.append('environmentId', environmentId);
      queryParams.append('limit', limit.toString());
      
      const restOperation = get({
        apiName,
        path: `/audit-log?${queryParams.toString()}`,
        options: { headers }
      });
      
      const response = await restOperation.response;
      const data = await response.body.json();
      return data.auditLog;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  }
}

export default new ApiClient();
