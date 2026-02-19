<a id="top"></a>

# 031 — Movement (Walk, Jump, Dodge, Dash)

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

## Movement Model Overview

Movement is modeled as:
- **desired velocity** from input (arcade)
- optional **inertia** (acceleration + friction), tunable
- state-based modifiers (roll/dash/jump/knockback)

The core uses a single update function per step:
1) Evaluate state machine (ground / air / roll / dash / locked)
2) Compute target movement (from input + modifiers)
3) Resolve collisions (world bounds + pushback)
4) Commit position (and velocity if enabled)

---

## Player Intent Input

The movement system consumes:
- `moveX`, `moveZ` in `[-1..1]` (already normalized/clamped)
- `jumpPressed`
- `dodgePressed` (roll)
- `dashPressed`

Mapping from devices is client-side (see `030_INPUT.md`).

---

## States

Movement state is explicit and deterministic.

### Ground states
- `GroundIdle`
- `GroundMove`

### Air states
- `AirJump` (ascending portion of fixed curve)
- `AirFall` (descending portion of fixed curve)
- `AirLandRecovery` (optional, short lock)

### Special movement states
- `Roll` (dodge)
- `Dash`
- `MovementLocked` (used by combat/hitstun if needed)

Notes:
- Combat may lock movement or apply modifiers, but movement defines how position evolves.

---

## Walk (Ground Movement)

### Parameters (tunable)
- `walk.maxSpeed` (units/sec)
- `walk.accel` (units/sec²) — inertia knob
- `walk.friction` (units/sec²) — inertia knob
- `walk.turnFrictionBoost` (optional)

### Default behavior (arcade-friendly)
We allow two modes via config:

**Mode A: Instant arcade (recommended default)**
- `walk.accel = 0`, `walk.friction = 0`
- velocity becomes `inputDir * walk.maxSpeed` immediately

**Mode B: Inertia**
- velocity approaches `inputDir * walk.maxSpeed` using accel
- when no input, velocity decays using friction

### Deterministic update (conceptual)
- compute `dir = normalize(moveX, moveZ)` (or zero)
- compute `vTarget = dir * walk.maxSpeed`
- if inertia disabled => `v = vTarget`
- else => approach `vTarget` by `walk.accel * dt`, and apply `walk.friction` when dir is zero

---

## Dodge Roll

Arcade dodge roll: short invulnerable-ish mobility move (exact i-frames are combat/hurtbox policy, but roll defines motion & lock).

### Parameters
- `roll.durationMs`
- `roll.speed` (units/sec)
- `roll.lockInput` (bool)
- `roll.allowSteer` (0..1) — steering factor during roll (default 0)
- `roll.cooldownMs`
- `roll.ghostOverlap` (bool) — whether roll ignores pushback collisions

### Rules
- Roll starts on `dodgePressed` if:
  - player is alive
  - not already rolling/dashing
  - not hard-locked by other systems
  - cooldown elapsed
- Roll direction:
  - if movement input is non-zero at start => use that direction
  - else => use facing direction (combat system defines facing; movement consumes it)
- During roll:
  - movement uses `roll.speed` in rollDir
  - input steering may blend if `roll.allowSteer > 0`
  - (optional) movement is locked if `roll.lockInput = true`
- On roll end:
  - return to ground state
  - apply short land recovery if configured

---

## Dash

Dash is a burst move, distinct from roll (less defensive, more positioning).

### Parameters
- `dash.durationMs`
- `dash.speed` (units/sec)
- `dash.lockInput` (bool)
- `dash.allowSteer` (0..1)
- `dash.cooldownMs`
- `dash.ghostOverlap` (bool)

### Rules
- Dash starts on `dashPressed` if eligible and off cooldown
- Direction selection same as roll:
  - prefer current move input, else facing
- During dash:
  - move at `dash.speed`
  - optional steering via `dash.allowSteer`
- Dash end:
  - transition to ground
  - optional recovery window

---

## Jump (Fixed Curve)

Jump is arcade: **fixed vertical curve**, not physics gravity.
We still allow the fun of launching enemies “too high” later via combat impulses, but the base player jump is deterministic and authorable.

### Parameters
- `jump.durationMs` (total airtime)
- `jump.height` (peak Y)
- `jump.airControl` in `[0..1]` — how much player can influence X/Z while airborne
- `jump.takeoffLockMs` (optional)
- `jump.landLockMs` (optional)
- `jump.horizontalSpeedScale` (optional multiplier vs walk)

### Curve
Jump defines a normalized time `t` from 0..1.

We use a fixed curve function `y(t)` with:
- `y(0) = 0`
- `y(0.5) = jump.height` (peak)
- `y(1) = 0`

Curve is a design choice but must be deterministic and stable.

### Air control rules (X/Z)
While airborne:
- desired horizontal movement is computed from input, but multiplied by `jump.airControl`
- if `jump.airControl = 0` => ballistic horizontal (locked) unless modified by other systems
- if `jump.airControl = 1` => full control (arcade-air steering)

Optional: scale horizontal speed in air:
- `airSpeed = walk.maxSpeed * jump.horizontalSpeedScale`

---

## Pushback Collisions (Character vs Character)

We support pushing to prevent stacking and improve readability.

### Parameters
- `collision.pushbackEnabled` (bool)
- `collision.ghostOverlap` (bool) — global override (or per state)
- `collision.radiusPlayer`
- `collision.radiusEnemy` (or per entity)
- `collision.maxResolveIterations` (small integer, deterministic)

### Rules
- If pushback enabled and not in ghost mode:
  - treat entities as circles on X/Z plane
  - when overlap occurs, resolve by separating along the minimal axis (center-to-center direction)
- Resolution must be deterministic:
  - stable iteration order (entity id order)
  - fixed max iterations
  - clamp separation to prevent jitter

### Ghost overlap
Ghost overlap can be enabled:
- globally via config
- or per state (roll/dash flags)
When ghost overlap is on, entities do not push each other.

---

## World Bounds and Lane Limits

Classic beat ’em ups often restrict Z range (alley depth).

### Parameters
- `bounds.minX`, `bounds.maxX`
- `bounds.minZ`, `bounds.maxZ`

Rules:
- After movement, clamp or slide along bounds (deterministic).
- Optional: allow small “soft bounds” with pushback feel (future).

---

## Determinism Notes

- All timers are advanced using deterministic `dt` accumulation (or fixed-step internally).
- State transitions depend only on:
  - current state
  - input frame
  - deterministic timers
  - deterministic collision results (stable ordering)

Recommended:
- internally simulate with fixed `dt` for consistent feel.

---

## Debug / Telemetry Events (Optional)

Movement can emit events useful for iteration:
- `MoveStateChanged(prev, next)`
- `RollStarted(dir)`
- `DashStarted(dir)`
- `JumpStarted()`
- `Landed()`
- `CollisionResolved(withEntityId)`

---

## Open Questions (To Lock Later)

- Exact lane depth feel: do we add “soft Z snapping” or keep pure free Z within bounds?
- Do roll/dash share cooldown/resource?
- Is there a short landing recovery by default, or instant control on landing?

---

↑ [Back to top](#top)
