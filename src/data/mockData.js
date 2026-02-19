export const MOCK_ENVIRONMENTS = [
  {
    id: 'env-mariposa-07',
    labName: 'Lab Mariposa 07',
    facility: 'West Tek Headquarters',
    researcher: { name: 'Dr. J. Whitmore', role: 'Senior Researcher' },
    experimentId: 'FEV-2077-ALPHA',
    experimentName: 'Forced Evolutionary Virus Batch 11-111',
    status: 'FROZEN',
    driftScore: 0,
    lastSnapshotAt: '2077.10.23 14:32:01',
    createdAt: '2077.08.15 09:00:00',
    constraints: [
      'DO NOT update Python beyond 3.8.12',
      'CUDA driver must remain at 11.4',
      'FEV analyzer package is proprietary - no modifications'
    ],
    cloudformationStackName: 'mariposa-07-stack',
    cloudformationStackStatus: 'UPDATE_COMPLETE',
    workspaceId: 'ws-mariposa07'
  },
  {
    id: 'env-westtek-12',
    labName: 'Lab West Tek 12',
    facility: 'West Tek Headquarters',
    researcher: { name: 'Dr. A. Petrov', role: 'Bio-Enhancement Lead' },
    experimentId: 'BIO-2078-SERIES9',
    experimentName: 'Bio-Enhancement Serum Series 9',
    status: 'ACTIVE',
    driftScore: 23,
    lastSnapshotAt: '2077.10.20 09:30:00',
    createdAt: '2077.09.01 10:15:00',
    constraints: [
      'Serum synthesis requires exact temperature control',
      'NumPy version locked for reproducibility'
    ],
    cloudformationStackName: 'westtek-12-stack',
    cloudformationStackStatus: 'UPDATE_COMPLETE'
  },
  {
    id: 'env-appalachia-03',
    labName: 'Lab Appalachia 03',
    facility: 'Appalachia Research Facility',
    researcher: { name: 'Dr. M. Chen', role: 'Chemical Engineer' },
    experimentId: 'CHM-2079-RESIST',
    experimentName: 'Chemical Resistance Protocol',
    status: 'STAGING',
    driftScore: null,
    lastSnapshotAt: null,
    createdAt: '2077.10.22 16:00:00',
    constraints: [],
    cloudformationStackName: 'appalachia-03-stack',
    cloudformationStackStatus: 'CREATE_IN_PROGRESS'
  },
  {
    id: 'env-mariposa-12',
    labName: 'Lab Mariposa 12',
    facility: 'West Tek Headquarters',
    researcher: { name: 'Dr. R. Grey', role: 'Principal Investigator' },
    experimentId: 'FEV-2076-7ALPHA',
    experimentName: 'FEV Batch 7-Alpha (Discontinued)',
    status: 'ARCHIVED',
    driftScore: 0,
    lastSnapshotAt: '2077.03.15 11:20:00',
    createdAt: '2076.11.10 08:00:00',
    constraints: [],
    cloudformationStackName: 'mariposa-12-stack',
    cloudformationStackStatus: 'DELETE_COMPLETE'
  },
  {
    id: 'env-westtek-05',
    labName: 'Lab West Tek 05',
    facility: 'West Tek Headquarters',
    researcher: { name: 'Dr. K. Okoye', role: 'Nanotech Specialist' },
    experimentId: 'NANO-2077-NNI2',
    experimentName: 'Nanotech Neural Interface v2',
    status: 'FROZEN',
    driftScore: 0,
    lastSnapshotAt: '2077.10.18 13:45:00',
    createdAt: '2077.07.20 14:30:00',
    constraints: [
      'Neural interface drivers are version-locked',
      'TensorFlow 2.8.0 required - do not upgrade'
    ],
    cloudformationStackName: 'westtek-05-stack',
    cloudformationStackStatus: 'UPDATE_COMPLETE'
  },
  {
    id: 'env-gnr-01',
    labName: 'Lab GNR 01',
    facility: 'Galaxy News Radio Research Wing',
    researcher: { name: 'Dr. H. Tanaka', role: 'Atmospheric Scientist' },
    experimentId: 'ATM-2077-RAD',
    experimentName: 'Atmospheric Radiation Analysis',
    status: 'ACTIVE',
    driftScore: 8,
    lastSnapshotAt: '2077.10.22 14:00:00',
    createdAt: '2077.09.10 11:00:00',
    constraints: [],
    cloudformationStackName: 'gnr-01-stack',
    cloudformationStackStatus: 'UPDATE_COMPLETE'
  }
];

export const MOCK_SNAPSHOTS = {
  'env-mariposa-07': [
    {
      id: 'snap-mar07-001',
      environmentId: 'env-mariposa-07',
      capturedAt: '2077.10.23 14:32:01',
      capturedBy: 'Dr. J. Whitmore',
      osVersion: 'Ubuntu 20.04.5 LTS',
      kernelVersion: '5.15.0-56-generic',
      packages: [
        { name: 'python3', version: '3.8.12' },
        { name: 'numpy', version: '1.21.0' },
        { name: 'scipy', version: '1.7.3' },
        { name: 'pandas', version: '1.3.5' },
        { name: 'wtek-datalogger', version: '2.1.0' },
        { name: 'fev-analyzer', version: '4.7.2' }
      ],
      services: [
        { name: 'sshd', status: 'active', version: '8.2p1' },
        { name: 'docker', status: 'active', version: '20.10.21' }
      ],
      environmentVariables: {
        'FEV_DATA_PATH': '/vault/data/fev',
        'CUDA_VISIBLE_DEVICES': '0,1'
      },
      drivers: [
        { name: 'NVIDIA Driver', version: '470.161.03' },
        { name: 'CUDA', version: '11.4' }
      ],
      diskImageHash: '7f3a9b2c1e4d5f6a8b9c0d1e2f3a4b5c',
      totalComponents: 142,
      verified: true
    }
  ],
  'env-westtek-12': [
    {
      id: 'snap-wtk12-001',
      environmentId: 'env-westtek-12',
      capturedAt: '2077.10.20 09:30:00',
      capturedBy: 'Dr. A. Petrov',
      osVersion: 'Ubuntu 20.04.5 LTS',
      kernelVersion: '5.15.0-56-generic',
      packages: [
        { name: 'python3', version: '3.8.12' },
        { name: 'numpy', version: '1.21.0' },
        { name: 'scipy', version: '1.7.3' }
      ],
      services: [
        { name: 'sshd', status: 'active', version: '8.2p1' }
      ],
      environmentVariables: {},
      drivers: [],
      diskImageHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
      totalComponents: 98,
      verified: true
    }
  ]
};

export const MOCK_DRIFT_EVENTS = [
  {
    id: 'drift-wtk12-001',
    environmentId: 'env-westtek-12',
    detectedAt: '2077.10.23 02:15:00',
    severity: 'WARNING',
    parameter: 'python3.numpy.version',
    expectedValue: '1.21.0',
    actualValue: '1.22.3',
    category: 'package',
    resolved: false
  },
  {
    id: 'drift-wtk12-002',
    environmentId: 'env-westtek-12',
    detectedAt: '2077.10.23 02:15:00',
    severity: 'WARNING',
    parameter: 'python3.version',
    expectedValue: '3.8.12',
    actualValue: '3.8.15',
    category: 'package',
    resolved: false
  },
  {
    id: 'drift-gnr01-001',
    environmentId: 'env-gnr-01',
    detectedAt: '2077.10.22 18:30:00',
    severity: 'INFO',
    parameter: 'sshd.config',
    expectedValue: 'PermitRootLogin no',
    actualValue: 'PermitRootLogin yes',
    category: 'config',
    resolved: false
  }
];

export const MOCK_AUDIT_LOG = [
  {
    id: 'log-001',
    timestamp: '2077.10.23 14:32:01',
    actor: 'Dr. J. Whitmore',
    environmentId: 'env-mariposa-07',
    action: 'SNAPSHOT_CAPTURED',
    details: 'Snapshot snap-mar07-001 captured. 142 components verified.',
    severity: 'info'
  },
  {
    id: 'log-002',
    timestamp: '2077.10.23 02:15:00',
    actor: 'SYSTEM',
    environmentId: 'env-westtek-12',
    action: 'DRIFT_DETECTED',
    details: 'Drift detected: 2 package version changes (WARNING severity)',
    severity: 'warning'
  },
  {
    id: 'log-003',
    timestamp: '2077.10.22 16:00:00',
    actor: 'Dr. M. Chen',
    environmentId: 'env-appalachia-03',
    action: 'STATE_CHANGED',
    details: 'Environment created with status STAGING',
    severity: 'info'
  },
  {
    id: 'log-004',
    timestamp: '2077.10.22 14:00:00',
    actor: 'SYSTEM',
    environmentId: 'env-gnr-01',
    action: 'SNAPSHOT_CAPTURED',
    details: 'Scheduled snapshot completed. All systems nominal.',
    severity: 'info'
  },
  {
    id: 'log-005',
    timestamp: '2077.10.20 09:30:00',
    actor: 'Dr. A. Petrov',
    environmentId: 'env-westtek-12',
    action: 'SNAPSHOT_CAPTURED',
    details: 'Baseline snapshot for Bio-Enhancement Series 9',
    severity: 'info'
  }
];
