# West Tek Vault Control — Design

## Architecture Overview

West Tek Vault Control is a single-page React application (JSX artifact) styled with Tailwind CSS utility classes and custom CSS for Fallout-themed effects. It integrates with real AWS services via the AWS SDK for JavaScript (v3) in the browser, with a graceful fallback to simulation mode when services are unavailable.

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (React SPA)                │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ENVIRON-  │ │  DRIFT   │ │ONBOARD-  │ │ VAULT  │ │
│  │MENTS TAB │ │MONITOR   │ │ING TAB   │ │  LOG   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       │             │            │            │      │
│  ┌────▼─────────────▼────────────▼────────────▼────┐ │
│  │              STATE MANAGER (React Context)       │ │
│  │  environments[] | driftReports[] | auditLog[]    │ │
│  │  activeTab | bootComplete | simulationMode       │ │
│  └────────────────────┬────────────────────────────┘ │
│                       │                              │
│  ┌────────────────────▼────────────────────────────┐ │
│  │              AWS SERVICE LAYER                   │ │
│  │  SSM Commands | CloudFormation | WorkSpaces      │ │
│  │  ─── fallback to MockDataProvider ───            │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │              │              │
    ┌────▼────┐   ┌────▼─────┐  ┌────▼──────┐
    │AWS SSM  │   │AWS CFN   │  │AWS Work-  │
    │Inventory│   │Drift Det │  │Spaces API │
    └─────────┘   └──────────┘  └───────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 (functional components, hooks) | SPA with state management |
| Styling | Tailwind CSS core utilities + custom CSS | Layout, Fallout theme effects |
| Fonts | VT323 (Google Fonts) | Terminal / Pip-Boy monospace aesthetic |
| Icons | Lucide React | Minimal iconography (lock, alert, terminal) |
| Charts | Recharts | Drift score gauges and timeline visualizations |
| Audio | Tone.js (optional) | Terminal key clicks, Geiger counter ticks |
| AWS SDK | @aws-sdk/client-ssm, @aws-sdk/client-cloudformation, @aws-sdk/client-workspaces | Real AWS API integration |
| Data | React Context + useReducer | Global state management |

---

## Design System: Vault-Tec Terminal OS

### Color Palette (CSS Variables)

```css
:root {
  --vt-green:        #00ff41;   /* Primary phosphor green */
  --vt-green-dim:    #00aa2a;   /* Secondary / muted green */
  --vt-green-glow:   #00ff4133; /* Green glow overlay */
  --vt-amber:        #ffb000;   /* Warning / amber */
  --vt-amber-dim:    #cc8d00;   /* Muted amber */
  --vt-red:          #ff4444;   /* Critical / danger */
  --vt-red-glow:     #ff444433; /* Red glow overlay */
  --vt-blue-ice:     #44ccff;   /* Frozen state */
  --vt-bg-dark:      #0a0a0a;   /* Primary background */
  --vt-bg-panel:     #0d1a0d;   /* Panel background (dark green tint) */
  --vt-bg-card:      #111a11;   /* Card background */
  --vt-border:       #00ff4144; /* Subtle green border */
  --vt-text-dim:     #00aa2a88; /* Dimmed text */
}
```

### Typography

- **Primary Font**: `'VT323', monospace` — All UI text, headings, body
- **Heading Scale**: 2.5rem (h1) → 1.8rem (h2) → 1.3rem (h3) → 1rem (body)
- **Letter Spacing**: `0.05em` globally for authentic terminal feel
- **Text Rendering**: `text-shadow: 0 0 8px var(--vt-green)` on all green text for phosphor glow

### CRT Effects (Custom CSS)

1. **Scanlines**: `::after` pseudo-element on body with repeating-linear-gradient (2px transparent / 2px rgba(0,0,0,0.3))
2. **Screen Curvature**: Subtle `perspective` + `rotateX(0.5deg)` on main container
3. **Flicker**: `@keyframes flicker` — opacity oscillates between 0.97 and 1.0 at irregular intervals
4. **Vignette**: Radial gradient overlay darkening edges of viewport
5. **Phosphor Persistence**: `text-shadow` with multiple layers creating bloom effect

### Component Patterns

**Environment Card**
```
┌─────────────────────────────────────┐
│ [STATUS DOT] LAB NAME        [LOCK] │
│ ─────────────────────────────────── │
│ Researcher: Dr. J. Whitmore         │
│ Experiment: FEV-2077-ALPHA          │
│ Snapshot:   2077.10.23 14:32:01     │
│                                     │
│ DRIFT SCORE ████████░░ 23/100       │
│                                     │
│ [SNAPSHOT] [FREEZE] [DETAILS]       │
└─────────────────────────────────────┘
```
- Border: 1px solid var(--vt-green) with box-shadow glow
- Status dot: CSS animation (pulse for active, static for frozen, blink for staging)
- Hover: Intensify border glow, slight scale(1.01)

**Alert Banner (Drift Detected)**
```
╔══════════════════════════════════════╗
║ ⚠ VAULT-TEC EMERGENCY BROADCAST    ║
║ DRIFT DETECTED: Lab-Mariposa-07     ║
║ Severity: CRITICAL | Score: 78/100  ║
║ [INVESTIGATE]           [DISMISS]   ║
╚══════════════════════════════════════╝
```
- Double-border using box-shadow technique
- Amber/red flashing animation on border
- ASCII-style box drawing characters in text

**Terminal Log Entry**
```
[2077.10.23 14:32:01] SNAPSHOT CAPTURED
  Environment: Lab-Mariposa-07
  Actor: Dr. J. Whitmore
  Components: 142 | Hash: 7f3a...b2c1
  Status: VERIFIED ✓
```
- Monospace, left-aligned, color-coded by event type
- Typewriter animation on newest entry

---

## Data Model

### Environment

```typescript
interface Environment {
  id: string;                          // "env-mariposa-07"
  labName: string;                     // "Lab Mariposa 07"
  facility: string;                    // "West Tek Headquarters"
  researcher: Researcher;
  experimentId: string;                // "FEV-2077-ALPHA"
  experimentName: string;              // "Forced Evolutionary Virus Batch 11-111"
  status: 'ACTIVE' | 'FROZEN' | 'STAGING' | 'ARCHIVED';
  snapshots: Snapshot[];
  driftScore: number;                  // 0-100
  driftEvents: DriftEvent[];
  researcherLog: LogEntry[];
  constraints: string[];               // Critical rules
  cloudformationStackName?: string;    // AWS CFN stack
  cloudformationStackStatus?: string;
  workspaceId?: string;                // AWS WorkSpaces ID
  createdAt: string;
  lastSnapshotAt: string;
}
```

### Snapshot

```typescript
interface Snapshot {
  id: string;
  environmentId: string;
  capturedAt: string;
  capturedBy: string;
  osVersion: string;
  kernelVersion: string;
  packages: PackageVersion[];          // {name, version}
  services: ServiceStatus[];           // {name, status, version}
  environmentVariables: Record<string, string>;
  drivers: DriverInfo[];               // {name, version}
  diskImageHash: string;
  totalComponents: number;
  verified: boolean;
}
```

### DriftEvent

```typescript
interface DriftEvent {
  id: string;
  environmentId: string;
  detectedAt: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  parameter: string;                   // "python3.version"
  expectedValue: string;               // "3.8.12"
  actualValue: string;                 // "3.8.15"
  category: string;                    // "package", "service", "os", "config"
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}
```

### AuditLogEntry

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  environmentId: string;
  action: 'SNAPSHOT_CAPTURED' | 'ENV_FROZEN' | 'ENV_UNFROZEN' | 'DRIFT_DETECTED' | 'DRIFT_RESOLVED' | 'STATE_CHANGED' | 'RESEARCHER_ASSIGNED' | 'ACCESS_PROVISIONED' | 'NOTE_ADDED';
  details: string;
  severity: 'info' | 'warning' | 'critical';
}
```

---

## AWS Integration Architecture

### 1. SSM Integration (Environment Snapshots & Drift)

**Snapshot Capture Flow:**
```
User clicks "Capture Snapshot"
  → SSM:SendCommand (AWS-RunShellScript)
    → Collects: uname -a, dpkg --list, systemctl list-units,
       env, lspci, sha256sum /dev/sda
  → SSM:GetCommandInvocation (poll for results)
  → Parse output → Store as Snapshot object
  → Update environment driftScore
```

**Drift Detection Flow:**
```
User triggers drift check (or auto-interval)
  → SSM:SendCommand (collect current state)
  → Compare against latest Snapshot
  → Generate DriftEvent[] for any deltas
  → Calculate new driftScore
  → If environment.status === 'FROZEN' && driftScore > 0:
      → Trigger VAULT-TEC EMERGENCY BROADCAST alert
```

**SSM Inventory (Alternative):**
```
  → SSM:GetInventory with filters for managed instances
  → Compare inventory schema against snapshot baseline
```

### 2. CloudFormation Integration (Stack Drift)

**Stack Status Check:**
```
User views environment details
  → CloudFormation:DescribeStacks (stackName)
  → Display: StackStatus, LastUpdatedTime, ResourceCount
```

**Drift Detection:**
```
User clicks "Check Stack Drift"
  → CloudFormation:DetectStackDrift (stackName)
  → CloudFormation:DescribeStackDriftDetectionStatus (poll)
  → CloudFormation:DescribeStackResourceDrifts
  → Map to DriftEvent[] with severity based on resource type
```

### 3. WorkSpaces Integration (Onboarding)

**Environment Provisioning (Onboarding Step 3):**
```
Onboarding wizard reaches "Access Provisioning"
  → WorkSpaces:DescribeWorkspaceBundles (list available)
  → Display bundle options themed as "Vault-Tec Standard Issue"
  → On confirm: WorkSpaces:CreateWorkspaces (or simulate)
  → WorkSpaces:DescribeWorkspaces (poll for status)
  → Display provisioning progress with Vault-Tec loading animation
```

### Graceful Degradation

```
AWS API Call
  ├─ Success → Use real data, display [LIVE] indicator
  └─ Failure (NetworkError / CredentialsError)
      → Log error to Vault Log
      → Switch to MockDataProvider for that service
      → Display [SIMULATION MODE] badge in header
      → Continue with realistic mock data
```

---

## Screen Layouts

### Boot Sequence (Full Screen Overlay)

```
Phase 1 (0-1s):    Black screen → Vault-Tec logo fade in (centered)
Phase 2 (1-2.5s):  Logo fades → Terminal text types out:
                    "ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL"
                    "COPYRIGHT 2077 ROBCO INDUSTRIES"
                    "SERVER: WEST-TEK-MAINFRAME-01"
Phase 3 (2.5-3.5s): "> CONNECTING TO VAULT-TEC NETWORK..."
                     "> AUTHENTICATION: DR. WHITMORE [VERIFIED]"
                     "> LOADING ENVIRONMENT CONTROL SYSTEM..."
Phase 4 (3.5-4s):  Glitch effect → Dashboard fade in
```

### Main Dashboard — ENVIRONMENTS Tab

```
┌──────────────────────────────────────────────────────┐
│ VAULT-TEC ENVIRONMENT CONTROL SYSTEM    [SIMULATION] │
│ ═══════════════════════════════════════════════════  │
│ ENVIRONMENTS │ DRIFT MONITOR │ ONBOARDING │ VAULT LOG│
│ ────────────────────────────────────────────────────  │
│                                                      │
│ ACTIVE: 4  FROZEN: 8  STAGING: 2  ARCHIVED: 12      │
│                                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │ Lab-Mar-07  │ │ Lab-WTK-12  │ │ Lab-App-03  │     │
│ │ 🔒 FROZEN   │ │ 🟢 ACTIVE   │ │ 🟡 STAGING  │     │
│ │ FEV-2077    │ │ BIO-2078    │ │ CHM-2079    │     │
│ │ Drift: 0    │ │ Drift: 23   │ │ Drift: --   │     │
│ │ [DETAILS]   │ │ [DETAILS]   │ │ [DETAILS]   │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │ Lab-Mar-12  │ │ Lab-WTK-05  │ │ Lab-GNR-01  │     │
│ │ ⚫ ARCHIVED │ │ 🔒 FROZEN   │ │ 🟢 ACTIVE   │     │
│ │ ...         │ │ ...         │ │ ...         │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                      │
│ ────────────────────────────────────────────────────  │
│ > System operational. 26 environments tracked.       │
│ > Last drift scan: 2077.10.23 14:30:00 [ALL CLEAR]  │
└──────────────────────────────────────────────────────┘
```

### DRIFT MONITOR Tab

```
┌──────────────────────────────────────────────────────┐
│ DRIFT MONITOR │ Global Overview                      │
│ ────────────────────────────────────────────────────  │
│                                                      │
│ ENVIRONMENTS WITH DRIFT:                             │
│                                                      │
│ Lab-WTK-12   ████████░░░░░░ 23/100  [2 WARNINGS]    │
│ Lab-GNR-01   ██░░░░░░░░░░░░  8/100  [1 INFO]        │
│ Lab-Mar-07   ░░░░░░░░░░░░░░  0/100  [CLEAN]         │
│                                                      │
│ ════════════════════════════════════════════════════  │
│ DRIFT DETAIL: Lab-WTK-12                             │
│ ────────────────────────────────────────────────────  │
│ PARAMETER       │ EXPECTED    │ ACTUAL     │ SEV     │
│ python3.version │ 3.8.12      │ 3.8.15     │ ⚠ WARN │
│ numpy.version   │ 1.21.0      │ 1.22.3     │ ⚠ WARN │
│ sshd.config     │ (unchanged) │ (modified) │ ℹ INFO │
│                                                      │
│ ────────────────────────────────────────────────────  │
│ DRIFT TIMELINE                                       │
│ [2077.10.23 02:15] python3 updated 3.8.12→3.8.15    │
│ [2077.10.23 02:15] numpy updated 1.21.0→1.22.3      │
│ [2077.10.22 14:00] Scheduled scan: ALL CLEAR         │
│ [2077.10.20 09:30] Snapshot verified: MATCH          │
└──────────────────────────────────────────────────────┘
```

---

## Mock Data Strategy

The application ships with rich, Fallout-themed mock data for compelling demos:

### Labs & Experiments (12+ environments)
- **Lab Mariposa 07** — FEV (Forced Evolutionary Virus) Batch 11-111 (Dr. Whitmore, FROZEN)
- **Lab West Tek 12** — Bio-Enhancement Serum Series 9 (Dr. Petrov, ACTIVE, has drift)
- **Lab Appalachia 03** — Chemical Resistance Protocol (Dr. Chen, STAGING)
- **Lab Mariposa 12** — FEV Batch 7-Alpha — discontinued (ARCHIVED)
- **Lab West Tek 05** — Nanotech Neural Interface v2 (Dr. Okoye, FROZEN)
- **Lab GNR 01** — Atmospheric Radiation Analysis (Dr. Tanaka, ACTIVE)
- **Lab Big MT 04** — Cybernetic Limb Integration (Dr. Mobius, FROZEN)
- **Lab Vault 87 02** — Super Mutant Behavioral Study (Dr. Lesko, ARCHIVED)

### Realistic Package Lists
- Python 3.8.12, numpy 1.21.0, scipy 1.7.3, pandas 1.3.5, CUDA 11.4, cuDNN 8.2.4
- Custom West Tek packages: `wtek-datalogger 2.1.0`, `fev-analyzer 4.7.2`, `vault-tec-crypto 1.0.3`

### Drift Scenarios (Pre-loaded)
- Lab-WTK-12: Python minor update + numpy update (WARNING level, score 23)
- Lab-GNR-01: SSH config change (INFO level, score 8)
- Lab-Mar-07: Clean — zero drift on frozen environment

---

## Interaction Flows

### Flow 1: Capture Snapshot
1. User clicks **[CAPTURE SNAPSHOT]** on environment card
2. Terminal animation: "> INITIATING VAULT-TEC ENVIRONMENT SCAN..."
3. Progress indicators tick through categories (OS, packages, services, drivers, disk)
4. Each category shows green checkmark as it completes
5. Final: "SNAPSHOT CAPTURED. HASH: [hash]. COMPONENTS: [n]. VERIFIED ✓"
6. Snapshot appears in environment timeline
7. Audit log entry created

### Flow 2: Freeze Environment
1. User clicks **[FREEZE]** on an ACTIVE environment
2. Confirmation modal: "INITIATE CONTAINMENT PROTOCOL? This will lock environment [name]. All modifications will be blocked."
3. On confirm: Ice-crystal animation spreads across card
4. Status changes to FROZEN with lock icon
5. Audit log entry: "CONTAINMENT PROTOCOL ENGAGED"

### Flow 3: Drift Alert
1. Drift scan detects change on FROZEN environment
2. Screen briefly flickers (glitch effect)
3. Emergency broadcast banner slides down from top
4. Geiger counter sound effect (if audio enabled)
5. Banner shows environment name, severity, drift score
6. User clicks [INVESTIGATE] → navigates to drift detail view
7. Diff table shows all changed parameters

### Flow 4: Onboarding Wizard
1. User navigates to ONBOARDING tab → clicks [BEGIN ORIENTATION]
2. Step 1 — Vault Assignment: Select lab from dropdown (filtered by FROZEN/ACTIVE)
3. Step 2 — Environment Briefing: Full snapshot display + researcher notes + constraints
4. Step 3 — Access Provisioning: "Deploying Vault-Tec Standard Issue Workstation..." with progress
5. Step 4 — Orientation Complete: Summary card with all access details
6. Audit log: "VAULT DWELLER ORIENTATION COMPLETE — [researcher] assigned to [lab]"
