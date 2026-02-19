import { createContext, useContext, useReducer, useEffect } from 'react';
import { MOCK_ENVIRONMENTS, MOCK_AUDIT_LOG, MOCK_DRIFT_EVENTS } from '../data/mockData';
import apiClient from '../services/apiClient';

const VaultContext = createContext();

const initialState = {
  environments: MOCK_ENVIRONMENTS,
  auditLog: MOCK_AUDIT_LOG,
  driftEvents: MOCK_DRIFT_EVENTS,
  activeTab: 'ENVIRONMENTS',
  bootComplete: false,
  simulationMode: true,
  loading: false,
  error: null
};

function vaultReducer(state, action) {
  switch (action.type) {
    case 'SET_BOOT_COMPLETE':
      return { ...state, bootComplete: true };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SIMULATION_MODE':
      return { ...state, simulationMode: action.payload };
    
    case 'SET_ENVIRONMENTS':
      return { ...state, environments: action.payload, simulationMode: false };
    
    case 'ADD_LOG_ENTRY':
      return {
        ...state,
        auditLog: [action.payload, ...state.auditLog]
      };
    
    case 'SET_AUDIT_LOG':
      return { ...state, auditLog: action.payload };
    
    case 'UPDATE_ENVIRONMENT':
      return {
        ...state,
        environments: state.environments.map(env =>
          env.id === action.payload.id ? { ...env, ...action.payload.updates } : env
        )
      };
    
    case 'ADD_DRIFT_EVENT':
      return {
        ...state,
        driftEvents: [...state.driftEvents, action.payload]
      };
    
    case 'SET_DRIFT_EVENTS':
      return { ...state, driftEvents: action.payload };
    
    default:
      return state;
  }
}

export function VaultProvider({ children }) {
  const [state, dispatch] = useReducer(vaultReducer, initialState);

  // Load environments from API on mount
  useEffect(() => {
    loadEnvironments();
    loadAuditLog();
  }, []);

  const loadEnvironments = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const environments = await apiClient.getEnvironments();
      dispatch({ type: 'SET_ENVIRONMENTS', payload: environments });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Failed to load environments, using mock data:', error);
      dispatch({ type: 'SET_SIMULATION_MODE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: 'Using simulation mode' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAuditLog = async () => {
    try {
      const auditLog = await apiClient.getAuditLog();
      dispatch({ type: 'SET_AUDIT_LOG', payload: auditLog });
    } catch (error) {
      console.error('Failed to load audit log:', error);
    }
  };

  const captureSnapshot = async (environmentId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await apiClient.captureSnapshot(environmentId);
      
      // Reload environments to get updated snapshot time
      await loadEnvironments();
      await loadAuditLog();
      
      return result;
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const freezeEnvironment = async (environmentId, action = 'freeze') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiClient.freezeEnvironment(environmentId, action);
      
      // Reload environments and audit log
      await loadEnvironments();
      await loadAuditLog();
    } catch (error) {
      console.error('Failed to freeze environment:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkDrift = async (environmentId) => {
    try {
      const result = await apiClient.checkDrift(environmentId);
      dispatch({ type: 'SET_DRIFT_EVENTS', payload: result.driftEvents });
      return result;
    } catch (error) {
      console.error('Failed to check drift:', error);
      throw error;
    }
  };

  const value = {
    ...state,
    dispatch,
    setBootComplete: () => dispatch({ type: 'SET_BOOT_COMPLETE' }),
    setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    addLogEntry: (entry) => dispatch({ type: 'ADD_LOG_ENTRY', payload: entry }),
    updateEnvironment: (id, updates) => dispatch({ type: 'UPDATE_ENVIRONMENT', payload: { id, updates } }),
    addDriftEvent: (event) => dispatch({ type: 'ADD_DRIFT_EVENT', payload: event }),
    // API methods
    loadEnvironments,
    loadAuditLog,
    captureSnapshot,
    freezeEnvironment,
    checkDrift
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within VaultProvider');
  }
  return context;
}
