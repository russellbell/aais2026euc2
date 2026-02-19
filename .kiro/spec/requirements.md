# West Tek Vault Control — Requirements

## Project Overview

**West Tek Vault Control** is a Fallout-themed environment preservation and drift detection dashboard for the West Tek Research hackathon. It enables researchers to snapshot, freeze, monitor, and transfer scientific computing environments — ensuring that "yesterday's results are trustworthy tomorrow."

The application is a React + Tailwind single-page application with real AWS service integration (WorkSpaces, SSM, CloudFormation) and a deeply immersive Pip-Boy / Vault-Tec terminal aesthetic.

---

## Requirement 1: Fallout-Themed Immersive UI Shell

### User Stories

- **As a user**, I want the application to feel like an authentic Vault-Tec / Pip-Boy terminal so that the experience is memorable and immersive.
- **As a user**, I want smooth navigation between sections with themed transitions so the experience feels cohesive.
- **As a demo viewer**, I want to immediately understand the Fallout theme within 3 seconds of seeing the screen.

### Acceptance Criteria

- [ ] Application uses a CRT monitor / Pip-Boy aesthetic: phosphor green (#00ff41) on deep black (#0a0a0a) with amber (#ffb000) accents for warnings and red (#ff4444) for critical alerts
- [ ] Custom scanline overlay effect renders across the entire viewport using CSS pseudo-elements
- [ ] CRT screen curvature effect is applied to the main content area using CSS transforms
- [ ] Screen flicker animation runs subtly on a continuous loop (CSS keyframes, ~0.1 opacity variance)
- [ ] Boot sequence plays on first load: Vault-Tec logo → "ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM" → "COPYRIGHT 2077" → terminal login prompt → dashboard fade-in (total ~4 seconds)
- [ ] Navigation uses a Pip-Boy tab bar with sections: **ENVIRONMENTS** | **DRIFT MONITOR** | **ONBOARDING** | **VAULT LOG**
- [ ] Tab switching includes a brief static/glitch transition effect (~200ms)
- [ ] All text uses a monospace terminal font (e.g., Share Tech Mono, VT323, or IBM Plex Mono from Google Fonts)
- [ ] UI includes Vault-Tec branding elements: vault door icons, Vault Boy-inspired status indicators, hazard stripes on warning elements
- [ ] Sound effects are optional but supported: key click on navigation, Geiger counter tick on drift alerts (muted by default with toggle)
- [ ] Responsive layout works on screens 1024px and above

---

## Requirement 2: Environment Snapshots & Lifecycle Management

### User Stories

- **As Dr. Whitmore (Senior Researcher)**, I want to capture a complete snapshot of my lab environment so that I can guarantee reproducibility of my experiment.
- **As Dr. Whitmore**, I want to freeze my environment so that no changes can be applied without my explicit approval.
- **As a researcher**, I want to see a clear lifecycle status for every environment so I know what state it's in.
- **As IT Operations**, I want to view all environments across labs so I can manage support load.

### Acceptance Criteria

- [ ] Dashboard displays a grid/list of lab environments with: Lab Name, Researcher, Experiment ID, Status, Last Snapshot Date, Drift Score
- [ ] Each environment shows one of four lifecycle states with distinct visual indicators:
  - 🟢 **ACTIVE** (green pulse) — experiment in progress, environment is live
  - 🔒 **FROZEN** (blue/ice static) — locked, no changes permitted
  - 🟡 **STAGING** (amber blink) — new environment being configured
  - ⚫ **ARCHIVED** (dim/grayed) — experiment complete, preserved for reference
- [ ] "Capture Snapshot" action triggers an AWS SSM document execution (or simulated) that collects: OS version, installed packages with versions, running services, environment variables, driver versions, disk image hash
- [ ] Snapshot data is displayed in a Pip-Boy-styled detail panel showing all captured configuration as terminal output
- [ ] "Freeze Environment" action changes lifecycle state to FROZEN and visually locks the environment card (ice crystal overlay, lock icon)
- [ ] Frozen environments display a warning modal if any action that would modify them is attempted: "⚠ VAULT-TEC PROTOCOL VIOLATION: Environment [name] is under containment lockdown. Modification requires Principal Investigator override."
- [ ] Environment detail view shows full snapshot history as a timeline (vertical terminal log style)
- [ ] Integration point: AWS CloudFormation stack status is pulled and displayed for each environment (stack name, status, last updated, resource count)
- [ ] Integration point: AWS WorkSpaces status (if applicable) shows connection state, bundle type, running mode

---

## Requirement 3: Drift Detection & Alerting

### User Stories

- **As Dr. Whitmore**, I want to be alerted immediately if anything in my frozen environment changes so that I can assess whether my experiment is compromised.
- **As IT Operations**, I want to see a global drift report across all environments so I can identify systemic issues.
- **As a Principal Investigator**, I want a drift severity score so I can prioritize which changes to investigate.

### Acceptance Criteria

- [ ] Drift detection compares the current environment state against the most recent snapshot
- [ ] Drift is categorized into severity levels:
  - **CRITICAL** (red) — OS version change, kernel update, core dependency version change
  - **WARNING** (amber) — service configuration change, new package installed, environment variable modified
  - **INFO** (green) — log rotation, temp file changes, non-impactful metadata
- [ ] Global drift dashboard shows all environments with a "Drift Score" (0-100, where 0 = perfect fidelity, 100 = fully drifted)
- [ ] Drift score is visualized as a Pip-Boy-style radial gauge or health bar per environment
- [ ] Clicking an environment with drift opens a diff view showing: parameter name, expected value (from snapshot), current value, severity, timestamp of change
- [ ] Drift alerts display as Vault-Tec emergency broadcast style notifications with amber/red flashing border
- [ ] Integration point: AWS SSM State Manager or SSM Inventory is used to detect configuration drift on EC2 instances
- [ ] Integration point: CloudFormation drift detection API is called to check stack drift status
- [ ] A "Drift Timeline" view shows historical drift events as a scrollable terminal log with timestamps
- [ ] Automatic drift checks can be toggled on/off per environment with configurable interval (simulated for demo)

---

## Requirement 4: Researcher Onboarding & Knowledge Transfer

### User Stories

- **As a new researcher joining Dr. Whitmore's lab**, I want to understand the exact environment configuration and its history so I can continue the experiment without disruption.
- **As a departing researcher**, I want to document my environment context so my successor can pick up without weeks of ramp-up.
- **As IT Operations**, I want a standardized onboarding flow so environment provisioning is consistent.

### Acceptance Criteria

- [ ] Onboarding wizard presents a step-by-step "Vault Dweller Orientation" flow:
  1. **Vault Assignment** — Select target lab and experiment
  2. **Environment Briefing** — View complete snapshot, drift history, and researcher notes
  3. **Access Provisioning** — Provision a WorkSpaces instance cloned from the frozen snapshot (simulated or real)
  4. **Orientation Complete** — Summary card with environment ID, access credentials placeholder, emergency contacts
- [ ] Each environment has a "Researcher's Log" — a rich text notes section where scientists document context, quirks, and institutional knowledge
- [ ] Researcher's Log entries are timestamped and attributed to the author
- [ ] Environment detail includes a "Configuration Manifest" — a downloadable/viewable document listing every component, version, and known constraint
- [ ] Onboarding flow includes a "Constraints Checklist" — critical rules for the environment (e.g., "DO NOT update Python beyond 3.8.12", "CUDA driver must remain at 11.4")
- [ ] Integration point: AWS WorkSpaces CreateWorkspace API is referenced for provisioning cloned environments
- [ ] Transfer of ownership action reassigns the environment's primary researcher with an audit log entry

---

## Requirement 5: Vault Log — Audit Trail & Activity Feed

### User Stories

- **As a Principal Investigator**, I want a complete audit trail of every action taken on my environments so I can defend my results during funding reviews.
- **As IT Operations**, I want to see who did what and when across all environments.

### Acceptance Criteria

- [ ] Vault Log displays a reverse-chronological feed of all system events styled as terminal output
- [ ] Events include: snapshot captured, environment frozen/unfrozen, drift detected, lifecycle state changed, researcher assigned/transferred, access provisioned
- [ ] Each log entry shows: timestamp, actor, environment, action, details
- [ ] Log entries are color-coded by severity/type matching the drift severity scheme
- [ ] Log is filterable by: environment, researcher, action type, date range
- [ ] Critical events (drift on frozen environments, unauthorized modifications) are highlighted with Vault-Tec warning styling
- [ ] Integration point: AWS CloudTrail events can be referenced for real API activity

---

## Non-Functional Requirements

- [ ] Application loads and completes boot sequence within 6 seconds on modern broadband
- [ ] All AWS API calls include error handling with Fallout-themed error messages (e.g., "VAULT-TEC SYSTEMS ERROR: External relay failure. Retry transmission?")
- [ ] Application gracefully degrades if AWS services are unreachable — switches to demo/mock data with a "[SIMULATION MODE]" indicator
- [ ] No sensitive credentials are stored client-side; AWS calls use temporary session tokens or are proxied
- [ ] Accessibility: all interactive elements are keyboard-navigable; color is not the sole indicator of state
