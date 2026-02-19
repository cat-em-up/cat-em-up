<a id="top"></a>

# Clients

← [Back to Index](00_INDEX.md)

---

## Goals

Define output-only clients that consume core results.

Clients:

- do not read devices
- do not map controls
- do not detect patterns
- do not affect simulation

They only consume:

- Snapshot (state)
- Events (signals)

---

## Data Contract

Core exposes:

- createGame(config, seed?)
- step(game, inputFrame, dt) => { snapshot, events }

Clients consume only `{ snapshot, events }`.

Input is produced by a separate deterministic control runtime (see Architecture).

---

## Snapshot

Snapshot is a read-only representation of world state.

Typical contents:

- entities: id, kind, position, facing, state
- hp values and death flags
- active attacks (if needed for animation)
- arena lock status
- segment/level ids useful for view

Snapshot must be:

- deterministic
- serializable
- free of engine objects

No functions. No references to DOM/Phaser/Three.

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

Events are immutable and processed once by clients.

---

## View Clients

View clients render frames from snapshot and react to events.

Responsibilities:

- sprites / animations
- reaction animations based on `reason`
- hit sparks, screen shake, freeze-frame
- camera follow policy and arena lock camera behavior
- UI elements (HP, prompts, debug text)
- optional debug overlays (hit/hurt volumes, bounds)

View clients never implement gameplay logic.

---

## Audio Client

Audio is driven by core events.

Responsibilities:

- map events to SFX
- handle music playback and loops
- play stingers on arena unlock / boss spawn
- volume mixing and ducking

Audio client never decides game outcomes.

---

## Timing

Clients must not drive gameplay time.

Recommended:

- a single runtime loop calls core step at fixed rate (e.g. 30 Hz)
- clients render at display rate (e.g. 60/120 Hz) using latest snapshot
- optional interpolation for visuals only

Clients can run at any frame rate without affecting simulation results.

---

## Rule of Separation (Locked)

- Input/Control runtime produces `InputFrame`
- Core simulates and emits `{ snapshot, events }`
- Clients present output only

No backchannels from clients to core besides the next `InputFrame` delivered by the control runtime.

---

↑ [Back to top](#top)
