# West Tek Vault Control

A Fallout-themed environment preservation and drift detection dashboard for scientific computing environments. Built for the West Tek Research hackathon.

## 🎮 Features

### Immersive Vault-Tec UI
- Authentic Pip-Boy/terminal aesthetic with CRT effects
- Scanlines, screen curvature, and phosphor glow
- Boot sequence animation with typewriter effects
- Glitch transitions between tabs

### Environment Management
- Track multiple lab environments with lifecycle states (ACTIVE, FROZEN, STAGING, ARCHIVED)
- Capture environment snapshots with animated terminal output
- Freeze environments to prevent unauthorized changes
- Real-time drift score visualization
- Detailed environment panels with full configuration history

### Drift Detection & Monitoring
- Global drift overview across all environments
- Parameter-level diff view (expected vs actual values)
- Severity classification (CRITICAL, WARNING, INFO)
- Emergency broadcast alerts for drift on frozen environments
- Historical drift timeline
- Expandable drift details per environment

### Researcher Onboarding
- 4-step wizard for new researcher orientation
- Environment assignment and briefing
- Critical constraints review with acknowledgment
- Simulated WorkSpaces provisioning
- Complete assignment summary

### Audit Trail
- Complete activity log with filtering
- Color-coded severity levels
- Protocol violation highlighting
- Environment and action type filters
- Real-time log updates

### Demo Mode
- Automated scenario showcasing drift detection
- Perfect for presentations and demos
- Simulates unauthorized package updates and alerts
- Step-by-step guided walkthrough

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Tech Stack

- **React 18** - UI framework with hooks
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Lucide React** - Icon library
- **Recharts** - Data visualization (ready for charts)

## 🎨 Theme

The application uses a carefully crafted Vault-Tec color palette:

- **Primary Green**: `#00ff41` (phosphor green with glow)
- **Amber**: `#ffb000` (warnings)
- **Red**: `#ff4444` (critical alerts)
- **Ice Blue**: `#44ccff` (frozen state)
- **Background**: `#0a0a0a` (deep black)

## 📋 Project Structure

```
src/
├── components/
│   ├── BootSequence.jsx       # Startup animation
│   ├── Header.jsx              # Top navigation bar
│   ├── EnvironmentCard.jsx     # Environment display cards
│   ├── EnvironmentDetail.jsx   # Full environment detail panel
│   ├── DriftMonitor.jsx        # Drift detection dashboard
│   ├── DriftAlert.jsx          # Emergency broadcast alerts
│   ├── VaultLog.jsx            # Audit trail
│   ├── OnboardingWizard.jsx    # 4-step researcher onboarding
│   ├── SnapshotTerminal.jsx    # Snapshot capture animation
│   ├── FreezeModal.jsx         # Freeze confirmation dialog
│   └── DemoMode.jsx            # Automated demo scenario
├── context/
│   └── VaultContext.jsx        # Global state management
├── data/
│   └── mockData.js             # Fallout-themed mock data
├── App.jsx                     # Main application
├── main.jsx                    # React entry point
└── index.css                   # Theme and CRT effects

## 🎬 Demo Mode

Click the `[DEMO MODE]` button in the header to run an automated scenario:

1. Shows healthy environments
2. Simulates unauthorized package update on Lab West Tek 12
3. Triggers drift detection and emergency alert
4. Navigates to Drift Monitor for investigation

Perfect for hackathon presentations!

## 🎯 Key User Flows

### Capture a Snapshot
1. Click `[SNAPSHOT]` on any environment card
2. Watch the terminal animation as the system scans
3. Snapshot is saved and logged to audit trail

### Freeze an Environment
1. Click `[FREEZE]` on an ACTIVE environment
2. Review the containment protocol warning
3. Confirm to lock the environment
4. Environment is now protected from changes

### Investigate Drift
1. Navigate to DRIFT MONITOR tab
2. Click on any environment with drift
3. Review the parameter-level diff table
4. See expected vs actual values with severity

### Onboard a Researcher
1. Navigate to ONBOARDING tab
2. Click `[BEGIN VAULT DWELLER ORIENTATION]`
3. Select environment and enter researcher details
4. Review briefing and acknowledge constraints
5. Wait for workspace provisioning
6. Complete orientation and return to dashboard

### View Environment Details
1. Click `[DETAILS]` on any environment card
2. View complete snapshot data
3. Review CloudFormation and WorkSpaces info
4. Check critical constraints and researcher notes

## 🔮 Future Enhancements

- AWS integration (SSM, CloudFormation, WorkSpaces)
- Sound effects (terminal clicks, Geiger counter)
- Real-time drift scanning with configurable intervals
- Export environment manifests
- Multi-user collaboration features

## 📝 License

Built for the West Tek Research hackathon. All Fallout references are for thematic purposes only.

## 🎮 Lore

In the year 2077, West Tek researchers need to preserve their experimental environments with absolute fidelity. The Vault-Tec Environment Control System ensures that yesterday's results remain trustworthy tomorrow, even after the bombs fall.

---

**"War. War never changes. But your environment configurations shouldn't either."**
