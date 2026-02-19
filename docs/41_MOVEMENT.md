<a id="top"></a>

# Movement (Walk, Jump, Dodge, Dash)

← [Back to Index](00_INDEX.md)

---

## Goals

Define deterministic movement rules for an arcade beat ’em up (SoR / Double Dragon / Final Fight feel).

Key requirements:

- X/Z plane movement (Y is visual/semantic height)
- Tunable feel (accel/friction may be zero for instant arcade response)
- Dodge roll + dash as first-class movement states
- Jump uses a fixed curve (not real gravity), with tunable air control
- Pushback collisions supported; ghost overlap available as a flag
- Deterministic: same inputs => same positions

---

## Coordinate System

Core uses 3D coordinates:

- X+ East
- Y+ Up
- Z+ South

Gameplay movement happens in the X/Z plane.  
Y is used for jump arc / airborne state and for visuals/collision semantics.

---

## Movement State Priority (Locked)

Movement resolution follows strict priority order (highest → lowest):

1. Dead
2. ForcedMovement (Knockback / Knockdown / Launch / Grabbed etc.)
3. Incapacitated (HitStun / ParryStun / BlockStun)
4. Roll / Dash
5. Air (Jump curve + optional air control)
6. Ground (Walk / Idle)

Higher-priority states fully override lower-priority movement.

---

## MovementLocked (Locked Rule)

`MovementLocked` is not a top-priority state.  
It is a control filter that disables player-driven movement.

### Effects

When `MovementLocked` is active:

- Ground movement input is ignored.
- Air control input is ignored.
- Roll/Dash cannot start.
- Facing updates from input may be suppressed (optional).

### Does NOT affect

- ForcedMovement states.
- Active knockback/launch trajectories.
- Active Roll/Dash (if lock reason is soft).
- Timers or animation logic.

### Cancellation Rules

If Roll/Dash is active and a new state is applied:

- If new state is ForcedMovement → Roll/Dash is cancelled immediately.
- If new state is Incapacitated (HitStun / ParryStun) → Roll/Dash is cancelled immediately.
- If new state is soft lock (Recovery / Cinematic) → Roll/Dash continues until completion.

---

## Movement Model Overview

Movement is modeled as:

- desired velocity from input
- optional inertia (acceleration + friction), tunable
- state-based modifiers (roll/dash/jump/forced movement)

Per simulation step:

1. Resolve highest-priority movement state.
2. Compute resulting velocity/trajectory.
3. Apply bounds and pushback resolution.
4. Commit position.

---

## Player Intent Input

The movement system consumes:

- `moveX`, `moveZ` in `[-1..1]`
- `jumpPressed`
- `dodgePressed`
- `dashPressed`

Device mapping is client-side.

---

## States

### Ground

- `GroundIdle`
- `GroundMove`

### Air

- `AirJump`
- `AirFall`
- `AirLandRecovery` (optional)

### Special

- `Roll`
- `Dash`

---

## Walk (Ground Movement)

### Parameters

- `walk.maxSpeed`
- `walk.accel`
- `walk.friction`
- `walk.turnFrictionBoost` (optional)

### Modes

**Instant Arcade Mode**

- `walk.accel = 0`
- `walk.friction = 0`
- velocity = inputDir \* maxSpeed

**Inertia Mode**

- velocity approaches target using accel
- decays using friction when no input

---

## Dodge Roll

### Parameters

- `roll.durationMs`
- `roll.speed`
- `roll.lockInput`
- `roll.allowSteer`
- `roll.cooldownMs`
- `roll.ghostOverlap`

### Rules

- Starts if alive, eligible, off cooldown.
- Direction = input if present, else facing.
- During roll:
  - Movement controlled by roll.speed.
  - Steering optional.
  - May ignore pushback if ghostOverlap true.
- Ends → return to Ground state.

---

## Dash

### Parameters

- `dash.durationMs`
- `dash.speed`
- `dash.lockInput`
- `dash.allowSteer`
- `dash.cooldownMs`
- `dash.ghostOverlap`

### Rules

- Starts if eligible and off cooldown.
- Direction selection same as roll.
- Ends → return to Ground.

---

## Jump (Fixed Curve)

### Parameters

- `jump.durationMs`
- `jump.height`
- `jump.airControl`
- `jump.takeoffLockMs`
- `jump.landLockMs`
- `jump.horizontalSpeedScale`

### Curve

- `y(0) = 0`
- `y(0.5) = jump.height`
- `y(1) = 0`

Deterministic function only.

### Air Control

- horizontal input scaled by `jump.airControl`
- 0 = no air control
- 1 = full arcade air control

---

## Pushback Collisions

### Parameters

- `collision.pushbackEnabled`
- `collision.ghostOverlap`
- `collision.radiusPlayer`
- `collision.radiusEnemy`
- `collision.maxResolveIterations`

### Rules

- Circle vs circle in X/Z.
- Stable iteration order.
- Fixed max iterations.
- Clamp separation to avoid jitter.

---

## World Bounds

### Parameters

- `bounds.minX`
- `bounds.maxX`
- `bounds.minZ`
- `bounds.maxZ`

### Rules

- Clamp or slide after movement.
- Deterministic resolution.

---

## Determinism Notes

- Timers use deterministic dt accumulation.
- State transitions depend only on state, input, timers, collision results.
- Fixed-step simulation recommended.

---

## Debug Events (Optional)

- `MoveStateChanged`
- `RollStarted`
- `DashStarted`
- `JumpStarted`
- `Landed`
- `CollisionResolved`

---

↑ [Back to top](#top)
