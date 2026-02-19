<a id="top"></a>

# View Clients

← [Back to Index](00_INDEX.md)

---

## Goals

Define output-only view clients that consume core results.

Multiple view client implementations may exist, all consuming the same
`{ snapshot, events }` API contract.

Examples:
- 2D renderer (Canvas / Phaser)
- 3D renderer (Three.js / WebGL)
- CLI debug renderer
- Headless test renderer

View clients:

- do not read devices
- do not map controls
- do not detect input patterns
- do not affect simulation

They only consume:

- Snapshot (state)
- Events (signals)

---

## Data Contract

Core exposes:

- `createGame(config, seed?)`
- `step(game, inputFrame, dt) => { snapshot, events }`

View clients consume only `{ snapshot, events }`.

Input is produced by a separate deterministic control runtime
(see Architecture).

---

## Snapshot

Snapshot is a read-only representation of world state.

Typical contents:

- entities: id, kind, position, facing, state
- hp values and death flags
- active attacks (if needed for animation)
- arena lock status
- segment/level identifiers useful for presentation

Snapshot must be:

- deterministic
- serializable
- free of engine objects

No functions.  
No references to DOM / Phaser / Three.

---

## Events

Events are emitted by core to drive presentation and debugging.

Examples:

- HitLanded
- ParryTriggered
- AttackStarted / AttackAborted
- StateApplied(entityId, state, reason, ms)
- EnemySpawned / EnemyDied
- ArenaLocked / ArenaUnlocked

Events are immutable and processed once by view clients.

---

## Responsibilities

View clients render frames from snapshot and react to events.

Responsibilities:

- sprites / models / animations
- reaction animations based on `reason`
- hit sparks, screen shake, freeze-frame
- camera follow policy and arena lock camera behavior
- UI elements (HP, prompts, debug text)
- optional debug overlays (hit/hurt volumes, bounds)

View clients never implement gameplay logic.

---

## Timing

View clients must not drive gameplay time.

Recommended:

- a single runtime loop calls core `step()` at fixed rate (e.g. 30 Hz)
- view clients render at display rate (e.g. 60/120 Hz) using latest snapshot
- optional interpolation for visuals only

View frame rate must not affect simulation results.

---

## Rule of Separation (Locked)

- Input/Control runtime produces `InputFrame`
- Core simulates and emits `{ snapshot, events }`
- View clients present output only

No backchannels from view clients to core besides the next `InputFrame`
delivered by the control runtime.

---

↑ [Back to top](#top)
