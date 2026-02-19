<a id="top"></a>

# Input Model (Frames, Actions, Buffering)

← [Back to Index](00_INDEX.md)

---

## Goals

This document defines the deterministic input model for the simulation core.

**Core principles:**

- Core consumes **actions**, not device buttons.
- Input is represented as a **per-frame snapshot** (`InputFrame`).
- Same input stream + same seed => same outcomes.
- Input rules are **tunable** via config (buffer windows, thresholds, priority).

---

## Core vs Client Responsibility

### Core (deterministic)

- Defines canonical action set (Move, Attack, Jump, Dodge, Dash, etc.)
- Consumes `InputFrame` each `step()`
- Applies buffering, gating, and priority rules
- Emits gameplay events (e.g. `ActionAccepted`, `ActionRejected`)

### Client (non-deterministic layer)

- Reads devices (keyboard/gamepad/touch)
- Applies platform-specific mapping and UX (dead zones, haptics, UI)
- Builds `InputFrame` stream and feeds it to core

**Core must never read physical inputs directly.**

---

## Step API Contract

Core public API shape:

- `createGame(config, seed?)`
- `step(game, inputFrame, dt) => { snapshot, events }`

`inputFrame` is assumed to be the authoritative input for this simulation tick.

---

## Canonical Actions

Action set is intentionally small and arcade-like.

### Movement

- `move` — analog vector on X/Z plane, normalized to `[-1..1]`

### Primary actions

- `attackLight`
- `attackHeavy`
- `jump`
- `dodgeRoll`
- `dash`

### Optional (reserved)

- `grab` / `interact`
- `taunt` (purely cosmetic)

The client may map multiple buttons to one action.

---

## InputFrame

`InputFrame` is a snapshot of the player intent for a single step.

### Fields (conceptual)

- `moveX: number` in `[-1..1]`
- `moveZ: number` in `[-1..1]`

Button-like actions are represented as **edges** and **holds**:

- `jumpPressed: boolean`
- `jumpHeld: boolean`
- `attackPressed: boolean`
- `dodgePressed: boolean`
- `dashPressed: boolean`

Optional:

- `aimX/aimZ` if we ever add directional attacks or throws

### Normalization rules

- Movement vector is clamped to unit length.
- Deadzone is a **client concern** by default, but core may re-apply a safety clamp.

---

## Digital vs Analog Movement

We support both:

- Keyboard (digital) => moveX/moveZ is `-1, 0, +1`
- Gamepad/touch => analog in `[-1..1]`

Core treats both identically.

---

## Buffering & Input Forgiveness

Arcade games feel good because inputs are forgiving.

Core supports configurable buffering windows (in milliseconds or frames):

- `buffer.attackMs`
- `buffer.jumpMs`
- `buffer.dodgeMs`
- `buffer.dashMs`

**Behavior:**

- If an action is pressed while it cannot be executed now, it may be stored in a buffer.
- The buffer expires after its window.
- When the character becomes eligible, the buffered action may fire automatically.

Example: press Jump during the last frames of recovery => jump triggers as soon as allowed.

---

## Action Gating (Eligibility)

Each action has a gating rule based on the character state.

Typical gating checks:

- `isAlive`
- `isStunned` / `hitStun`
- `isInRecovery`
- `isAirborne`
- `isInRoll`
- `hasDashCooldown`

Gating is deterministic and defined in core systems (movement/combat).

---

## Priority & Conflicts

Some inputs may happen on the same frame.

We define deterministic priority order (tunable, but explicit).

Default priority (proposed):

1. `dodgeRoll` (defensive intent)
2. `dash` (mobility burst)
3. `jump`
4. `attack`

Movement vector is always applied unless the current state locks movement.

If multiple actions are buffered and become eligible on the same frame:

- resolve by the same priority order
- discard lower-priority action or keep it buffered (configurable)

---

## Repeats, Holds, and Auto-Repeat

By default, button actions are **edge-triggered**:

- Only `Pressed` triggers an action.
- `Held` is used for:
  - variable jump control (if we choose later)
  - charge attacks (reserved)

Auto-repeat (e.g. hold Attack to chain) is not a core rule unless explicitly added.

---

## Config Knobs (Tuning Surface)

Input should be easy to tune without rewrites.

### Proposed tuning parameters

- `input.deadzoneMove` (optional safety, usually client-side)
- `input.buffer.attackMs`
- `input.buffer.jumpMs`
- `input.buffer.dodgeMs`
- `input.buffer.dashMs`
- `input.priorityOrder` (list)
- `input.allowBufferedLowerPriority` (bool)
- `input.maxBufferedActionsPerType` (usually 1)

---

## Determinism Notes

To keep simulation deterministic:

- Core must not use wall-clock time.
- All buffering uses accumulated deterministic time from `dt` and/or frame counts.
- If `dt` varies, buffering comparisons must be stable (prefer frame-based where possible).

Recommended:

- Use fixed-step simulation internally (client may render interpolated).

---

## Events (Optional but Useful)

Core may emit events to support debugging and tooling:

- `InputActionAccepted(action)`
- `InputActionRejected(action, reason)`
- `InputActionBuffered(action, ttl)`
- `InputActionExpired(action)`

These events are non-gameplay critical but improve iteration speed.

---

## Open Questions (To Lock Later)

- Do we keep `attackHeavy` from day one or unlock it later?
- How much air-control during jump is allowed (see movement doc)?
- Should dash and roll share a resource/cooldown?

---

↑ [Back to top](#top)
