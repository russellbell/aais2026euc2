# West Tek Vault Control — Tasks

## Phase 1: Foundation & Theme Engine (Priority: HIGHEST)

### Task 1.1: Project Scaffolding & Design System
**Requirement:** Req 1 (Immersive UI Shell)
**Acceptance Criteria:** Color palette, typography, CRT effects

- [ ] Create React component with Tailwind + custom CSS variables for Vault-Tec color palette
- [ ] Import VT323 font from Google Fonts, apply globally with letter-spacing: 0.05em
- [ ] Implement text-shadow phosphor glow on all `--vt-green` text elements
- [ ] Create CSS custom properties for all theme tokens (colors, shadows, borders)
- [ ] Build base layout: full-viewport container with `--vt-bg-dark` background

### Task 1.2: CRT Screen Effects
**Requirement:** Req 1 (Immersive UI Shell)
**Acceptance Criteria:** Scanline overlay, screen curvature, flicker, vignette

- [ ] Implement scanline overlay using `::after` pseudo-element with `repeating-linear-gradient`
- [ ] Add subtle screen curvature via CSS `perspective` transform on main content wrapper
- [ ] Create `@keyframes flicker` animation (opacity 0.97→1.0, irregular timing)
- [ ] Add vignette effect using radial-gradient overlay (transparent center → dark edges)
- [ ] Ensure all effects are layered with proper z-index (effects above content but below modals)
- [ ] Add CSS class to toggle effects on/off for accessibility

### Task 1.3: Boot Sequence Animation
**Requirement:** Req 1 (Immersive UI Shell)
**Acceptance Criteria:** 4-phase boot sequence on first load

- [ ] Create `BootSequence` component with 4 timed phases using `useState` + `useEffect`
- [ ] Phase 1 (0-1s): Vault-Tec styled logo centered, fade in from black
- [ ] Phase 2 (1-2.5s): Typewriter effect for ROBCO INDUSTRIES text lines (character by character)
- [ ] Phase 3 (2.5-3.5s): Connection/auth messages with blinking cursor
- [ ] Phase 4 (3.5-4s): Glitch transition (brief CSS distortion) → fade to dashboard
- [ ] Store `bootComplete` in state so boot only plays once per session
- [ ] Add "Skip" text in bottom-right corner that completes boot instantly on click

### Task 1.4: Navigation Tab Bar
**Requirement:** Req 1 (Immersive UI Shell)
**Acceptance Criteria:** Pip-Boy tab bar, glitch transitions

- [ ] Build horizontal tab bar component: ENVIRONMENTS | DRIFT MONITOR | ONBOARDING | VAULT LOG
- [ ] Style as Pip-Boy selector: green text, underline active tab with `--vt-green`, dim inactive
- [ ] Implement tab switching with `activeTab` state
- [ ] Add brief glitch/static transition effect (~200ms) on tab change using CSS animation
- [ ] Ensure tab bar is sticky at top of content area below header
- [ ] Add keyboard navigation (arrow keys to switch tabs)

### Task 1.5: Header & Status Bar
**Requirement:** Req 1 (Immersive UI Shell), Req NFR (Simulation mode)

- [ ] Create header: "VAULT-TEC ENVIRONMENT CONTROL SYSTEM" with ASCII decorative borders
- [ ] Add `[SIMULATION MODE]` / `[LIVE]` badge that reflects AWS connectivity status
- [ ] Add current date/time in Fallout format (e.g., "2077.10.23 14:32:01")
- [ ] Add audio toggle icon (muted by default)
- [ ] Style with double-line border bottom using box-shadow technique

---

## Phase 2: Data Layer & State Management

### Task 2.1: Data Models & Mock Data
**Requirement:** All requirements (data foundation)

- [ ] Define TypeScript-style interfaces as JSDoc comments: Environment, Snapshot, DriftEvent, AuditLogEntry, Researcher
- [ ] Create `MOCK_ENVIRONMENTS` array with 8+ Fallout-themed labs (per design doc)
- [ ] Create `MOCK_SNAPSHOTS` with realistic package lists (Python, CUDA, numpy, wtek-* packages)
- [ ] Create `MOCK_DRIFT_EVENTS` with pre-loaded drift scenarios for Lab-WTK-12 and Lab-GNR-01
- [ ] Create `MOCK_AUDIT_LOG` with 20+ historical entries spanning events across all labs
- [ ] Ensure all timestamps use Fallout-era dates (2077.xx.xx format)

### Task 2.2: Global State (React Context + useReducer)
**Requirement:** All requirements (state management)

- [ ] Create `VaultContext` with React.createContext
- [ ] Implement `vaultReducer` with actions: SET_ENVIRONMENTS, ADD_SNAPSHOT, UPDATE_DRIFT, ADD_LOG_ENTRY, CHANGE_STATUS, SET_ACTIVE_TAB, SET_SIMULATION_MODE, SET_BOOT_COMPLETE
- [ ] Create `VaultProvider` component wrapping the app with initial mock data
- [ ] Create `useVault()` custom hook for consuming context
- [ ] Implement helper functions: `captureSnapshot()`, `freezeEnvironment()`, `checkDrift()`, `addLogEntry()`
- [ ] All state mutations auto-append to audit log

### Task 2.3: AWS Service Layer
**Requirement:** Req 2, 3, 4 (AWS integration points)

- [ ] Create `awsService` module with functions for each AWS API call
- [ ] `ssmCaptureSnapshot(instanceId)` — SSM:SendCommand + GetCommandInvocation
- [ ] `cfnDescribeStack(stackName)` — CloudFormation:DescribeStacks
- [ ] `cfnDetectDrift(stackName)` — CloudFormation:DetectStackDrift + DescribeStackResourceDrifts
- [ ] `wsDescribeBundles()` — WorkSpaces:DescribeWorkspaceBundles
- [ ] `wsCreateWorkspace(params)` — WorkSpaces:CreateWorkspaces
- [ ] Wrap every AWS call in try/catch → on failure, log to Vault Log + fall back to mock data
- [ ] Export `isSimulationMode` flag that components can check
- [ ] All error messages use Fallout theme: "VAULT-TEC SYSTEMS ERROR: [description]"

---

## Phase 3: Environments Tab (Priority: HIGH)

### Task 3.1: Environment Cards Grid
**Requirement:** Req 2 (Environment Snapshots & Lifecycle)
**Acceptance Criteria:** Grid/list of environments with status, drift score

- [ ] Create `EnvironmentCard` component displaying: lab name, researcher, experiment ID, status, last snapshot, drift score
- [ ] Style as terminal-bordered card with `1px solid var(--vt-green)` + glow box-shadow
- [ ] Status indicator: colored dot with CSS animation (pulse=ACTIVE, static=FROZEN, blink=STAGING, dim=ARCHIVED)
- [ ] Drift score as horizontal bar: green (0-25) → amber (26-60) → red (61-100)
- [ ] FROZEN environments have ice-blue tinted border + lock icon
- [ ] Hover effect: intensify glow, slight scale
- [ ] Create `EnvironmentGrid` component rendering cards in responsive 3-column grid

### Task 3.2: Status Summary Bar
**Requirement:** Req 2

- [ ] Create summary bar above grid: "ACTIVE: n | FROZEN: n | STAGING: n | ARCHIVED: n"
- [ ] Each count is color-coded to match its status
- [ ] Clicking a status label filters the grid to that status
- [ ] "ALL" option to reset filter

### Task 3.3: Environment Detail Panel
**Requirement:** Req 2
**Acceptance Criteria:** Snapshot detail, history timeline, CFN status

- [ ] Create `EnvironmentDetail` component as a slide-in panel or modal
- [ ] Display full environment info: lab, facility, researcher, experiment, status, constraints
- [ ] Show latest snapshot data in terminal-output style (monospace, indented, color-coded)
- [ ] Snapshot history as vertical timeline (newest at top, each with hash + component count)
- [ ] CloudFormation section: stack name, status (with color), last updated, resource count
- [ ] WorkSpaces section: workspace ID, connection state, bundle type, running mode
- [ ] "Researcher's Log" section showing notes with timestamps and authors
- [ ] "Constraints" section listing critical rules in red/amber

### Task 3.4: Capture Snapshot Action
**Requirement:** Req 2
**Acceptance Criteria:** Snapshot triggers SSM, displays terminal animation

- [ ] "CAPTURE SNAPSHOT" button on environment card and detail panel
- [ ] On click: open terminal overlay with typewriter animation
- [ ] Show progress: "Scanning OS... ✓", "Scanning packages... ✓", etc. (5 categories)
- [ ] Attempt real AWS SSM call → fall back to mock with 2s simulated delay
- [ ] On complete: display hash, component count, "VERIFIED ✓"
- [ ] Add new snapshot to environment state + create audit log entry
- [ ] Close terminal overlay → updated card reflects new snapshot date

### Task 3.5: Freeze/Unfreeze Environment Action
**Requirement:** Req 2
**Acceptance Criteria:** Freeze changes state, shows warning on modification attempts

- [ ] "FREEZE" button on ACTIVE environment cards
- [ ] Confirmation modal: "INITIATE CONTAINMENT PROTOCOL?" with environment name
- [ ] On confirm: ice-crystal spread animation (CSS) → status changes to FROZEN
- [ ] "UNFREEZE" button on FROZEN cards (requires confirmation + reason text)
- [ ] Attempting any modification on FROZEN env shows protocol violation modal
- [ ] Audit log entries for freeze/unfreeze actions

---

## Phase 4: Drift Monitor Tab (Priority: HIGH)

### Task 4.1: Global Drift Overview
**Requirement:** Req 3 (Drift Detection)
**Acceptance Criteria:** All environments with drift scores, severity counts

- [ ] Create `DriftMonitor` component showing all non-archived environments
- [ ] Each row: environment name, drift score bar, severity breakdown (n CRITICAL, n WARNING, n INFO)
- [ ] Sort by drift score descending (most drifted first)
- [ ] Clean environments (score 0) show "[CLEAN]" in green
- [ ] Row click expands to show drift detail

### Task 4.2: Drift Detail / Diff View
**Requirement:** Req 3
**Acceptance Criteria:** Parameter diff table with expected vs actual

- [ ] Create `DriftDetail` component showing parameter-level diff
- [ ] Table columns: Parameter, Expected Value, Actual Value, Severity, Detected At
- [ ] Row color-coding: red background tint for CRITICAL, amber for WARNING, default for INFO
- [ ] Each parameter is clickable to show full context (what component, which snapshot baseline)
- [ ] "Resolve" action per drift event (marks as resolved, adds audit entry)

### Task 4.3: Drift Score Visualization
**Requirement:** Req 3
**Acceptance Criteria:** Visual gauge per environment

- [ ] Create `DriftGauge` component using Recharts radial bar or custom SVG
- [ ] Gauge colors: green (0-25), amber (26-60), red (61-100)
- [ ] Animate on load/update
- [ ] Display in both environment cards and drift monitor

### Task 4.4: Drift Alert System
**Requirement:** Req 3
**Acceptance Criteria:** Emergency broadcast notifications for drift on frozen environments

- [ ] Create `DriftAlert` component: banner at top of screen
- [ ] Styled as "VAULT-TEC EMERGENCY BROADCAST" with double border, flashing amber/red
- [ ] Shows environment name, severity, score
- [ ] [INVESTIGATE] button → navigates to drift detail
- [ ] [DISMISS] button → hides banner (but drift remains in monitor)
- [ ] Auto-trigger when drift is detected on a FROZEN environment
- [ ] Optional: Geiger counter tick sound via Tone.js (if audio enabled)

### Task 4.5: Drift Timeline
**Requirement:** Req 3
**Acceptance Criteria:** Historical drift events as scrollable log

- [ ] Create `DriftTimeline` component: reverse-chronological terminal log
- [ ] Each entry: timestamp, event description, severity icon
- [ ] Filter by environment
- [ ] "Check Now" button triggers drift scan (real SSM/CFN or simulated)

### Task 4.6: AWS CloudFormation Drift Integration
**Requirement:** Req 3

- [ ] "CHECK STACK DRIFT" button in environment detail
- [ ] Calls `cfnDetectDrift()` → polls `DescribeStackDriftDetectionStatus`
- [ ] Maps CFN drift results to DriftEvent objects
- [ ] Displays resource-level drift: resource type, expected properties, actual properties
- [ ] Falls back to mock CFN drift data on failure

---

## Phase 5: Onboarding Tab (Priority: MEDIUM)

### Task 5.1: Onboarding Wizard Shell
**Requirement:** Req 4 (Onboarding)
**Acceptance Criteria:** 4-step wizard with Vault Dweller theme

- [ ] Create `OnboardingWizard` component with step indicator (Step 1/4, 2/4, etc.)
- [ ] Style step indicator as Pip-Boy progress bar with vault numbers
- [ ] "BEGIN VAULT DWELLER ORIENTATION" button to start wizard
- [ ] Back/Next navigation between steps
- [ ] Themed section headers for each step

### Task 5.2: Step 1 — Vault Assignment
**Requirement:** Req 4

- [ ] Dropdown to select target lab (filtered to ACTIVE and FROZEN environments)
- [ ] On select: show brief environment summary card
- [ ] Text input for new researcher name and role
- [ ] "Assign" advances to Step 2

### Task 5.3: Step 2 — Environment Briefing
**Requirement:** Req 4
**Acceptance Criteria:** Full snapshot, drift history, researcher notes, constraints

- [ ] Display selected environment's latest snapshot (read-only terminal view)
- [ ] Show drift history summary
- [ ] Display Researcher's Log entries
- [ ] Highlight Constraints Checklist in amber/red (critical rules the new researcher must follow)
- [ ] "Acknowledged" checkbox before proceeding

### Task 5.4: Step 3 — Access Provisioning
**Requirement:** Req 4
**Acceptance Criteria:** WorkSpaces provisioning (real or simulated)

- [ ] Display "Deploying Vault-Tec Standard Issue Workstation..."
- [ ] Attempt real AWS WorkSpaces:CreateWorkspaces → fall back to simulation
- [ ] Animated progress: terminal messages with status updates
- [ ] Show bundle details: "VAULT-TEC STANDARD ISSUE: 4 vCPU, 16 GB RAM, 100 GB SSD"
- [ ] On complete: "WORKSTATION DEPLOYED. ACCESS READY."

### Task 5.5: Step 4 — Orientation Complete
**Requirement:** Req 4

- [ ] Summary card with: environment ID, assigned researcher, access details, key constraints
- [ ] "Download Orientation Packet" button (generates a summary as text)
- [ ] "RETURN TO DASHBOARD" button
- [ ] Audit log entry: "VAULT DWELLER ORIENTATION COMPLETE"

---

## Phase 6: Vault Log Tab (Priority: MEDIUM)

### Task 6.1: Audit Log Feed
**Requirement:** Req 5 (Vault Log)
**Acceptance Criteria:** Reverse-chronological terminal feed, color-coded, filterable

- [ ] Create `VaultLog` component: scrollable terminal output
- [ ] Each entry styled as terminal log line with timestamp, actor, action, details
- [ ] Color-coding: green (info), amber (warning), red (critical)
- [ ] Newest entry appears with typewriter animation
- [ ] Smooth scroll behavior

### Task 6.2: Log Filters
**Requirement:** Req 5
**Acceptance Criteria:** Filter by environment, researcher, action type, date range

- [ ] Filter bar with dropdowns: Environment (all + list), Action Type (all + list), Severity
- [ ] Text search across log entry details
- [ ] Date range selector (Fallout-era dates)
- [ ] Active filter count badge
- [ ] "Clear Filters" button

### Task 6.3: Critical Event Highlighting
**Requirement:** Req 5
**Acceptance Criteria:** Special styling for critical events

- [ ] Drift events on FROZEN environments get double-border + flashing indicator
- [ ] Unauthorized modification attempts get red background tint
- [ ] "Protocol Violation" entries get Vault-Tec hazard stripe decoration

---

## Phase 7: Polish & Demo Readiness (Priority: HIGH)

### Task 7.1: Demo Scenario Automation
**Requirement:** All (demo quality)

- [ ] Create "DEMO MODE" button in header that auto-runs a compelling scenario:
  1. Show dashboard with healthy environments
  2. Trigger drift on Lab-WTK-12 (live animation)
  3. Emergency broadcast alert fires
  4. User investigates → sees diff
  5. Quick onboarding walkthrough
- [ ] Each step advances on click or auto-advances after 5s
- [ ] Ensures judges see all key features without manual navigation

### Task 7.2: Sound Effects (Optional)
**Requirement:** Req 1

- [ ] Terminal key click on tab navigation (Tone.js synth, very subtle)
- [ ] Geiger counter tick on drift detection
- [ ] Boot sequence hum
- [ ] All muted by default, toggle in header
- [ ] Graceful handling if Tone.js fails to load

### Task 7.3: Loading & Empty States
**Requirement:** NFR

- [ ] Loading spinner: rotating Vault-Tec gear icon (CSS animation)
- [ ] Empty states: "NO ENVIRONMENTS FOUND. CONTACT VAULT-TEC ADMINISTRATION."
- [ ] Error states: "VAULT-TEC SYSTEMS ERROR: [message]. RETRY TRANSMISSION?"
- [ ] All states maintain theme consistency

### Task 7.4: Final QA & Accessibility
**Requirement:** NFR

- [ ] Verify all interactive elements are keyboard-navigable (tab order, focus rings)
- [ ] Ensure color is not sole indicator (add text labels alongside colored dots)
- [ ] Test with CRT effects toggled off for accessibility
- [ ] Verify graceful degradation when AWS services are unavailable
- [ ] Performance check: boot sequence + dashboard render < 6 seconds
- [ ] Cross-browser check: Chrome, Firefox, Edge

---

## Implementation Order (Recommended)

| Priority | Tasks | Estimated Effort | Rationale |
|----------|-------|-----------------|-----------|
| 🔴 Sprint 1 | 1.1–1.5, 2.1–2.2 | Foundation | Theme + data must come first |
| 🔴 Sprint 2 | 3.1–3.5 | Core Feature | Environments tab is the centerpiece |
| 🟡 Sprint 3 | 4.1–4.6 | Core Feature | Drift detection is key differentiator |
| 🟡 Sprint 4 | 2.3, 4.6 | Integration | Real AWS calls elevate the demo |
| 🟢 Sprint 5 | 5.1–5.5 | Supporting | Onboarding completes the story |
| 🟢 Sprint 6 | 6.1–6.3 | Supporting | Vault Log adds audit depth |
| 🔵 Sprint 7 | 7.1–7.4 | Polish | Demo mode + final touches |

**Critical Path:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 7
**If time is short, skip:** Task 7.2 (sound), Task 5.4 (real WorkSpaces call), Task 6.2 (advanced filters)
